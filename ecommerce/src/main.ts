/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { execSync } from 'node:child_process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';

declare const module: any;

function runPrismaMigrations() {
	console.log('Checking and applying Prisma migrations...');
	try {
		execSync('npx prisma db push', { stdio: 'inherit' });
		execSync('npx prisma db seed', { stdio: 'inherit' });
		console.log('Prisma migrations applied successfully.');
	} catch (error) {
		console.error('Failed to apply Prisma migrations:', error);
		process.exit(1);
	}
}

async function ensureKafkaTopics(brokers: string[]) {
	console.log('Connecting to Kafka to ensure topics exist...');
	const kafka = new Kafka({
		clientId: 'kafka-topic-creator',
		brokers,
	});
	const admin = kafka.admin();
	try {
		await admin.connect();
		console.log('Kafka Admin connected. Creating topics...');
		await admin.createTopics({
			waitForLeaders: true,
			topics: [{ topic: 'user_created' }],
		});
		console.log('Topic "user_created" is ready.');
	} catch (error) {
		console.error('Failed to create Kafka topics:', error);
		process.exit(1);
	} finally {
		await admin.disconnect();
		console.log('Kafka Admin disconnected.');
	}
}

async function bootstrap() {
	runPrismaMigrations();

	const brokers = ['kafka:29092'];
	await ensureKafkaTopics(brokers);

	const app = await NestFactory.create(AppModule);

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.KAFKA,
		options: {
			client: {
				brokers,
				retry: {
					initialRetryTime: 300,
					retries: 8,
				},
			},
			consumer: {
				groupId: 'ecommerce-consumer',
			},
		},
	});

	const configService = app.get(ConfigService);
	const port = configService.get<number>('PORT') || 3000;

	await app.startAllMicroservices();
	await app.listen(port);
	console.log(`Application is running on: ${await app.getUrl()}`);

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}
}
bootstrap();
