/*
	eslint-disable @typescript-eslint/no-unsafe-assignment,
	@typescript-eslint/no-unsafe-call,
	@typescript-eslint/no-unsafe-member-access
*/
import { execSync } from 'node:child_process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

function runPrismaMigrations() {
	console.log('Checking and applying Prisma migrations...');
	try {
		// `prisma migrate deploy` é o comando ideal para ambientes de produção/staging.
		// Ele não gera novos arquivos de migração, apenas aplica os existentes.
		execSync('npx prisma migrate deploy', { stdio: 'inherit' });
		execSync('npx prisma db seed', { stdio: 'inherit' });
		console.log('Prisma migrations applied successfully.');
	} catch (error) {
		console.error('Failed to apply Prisma migrations:', error);
		process.exit(1);
	}
}

async function bootstrap() {
	runPrismaMigrations();
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const port = configService.get<number>('PORT') || 3000;
	await app.listen(port);
	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
