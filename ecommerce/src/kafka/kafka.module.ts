import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
	imports: [
		ClientsModule.register([
			{
				name: 'KAFKA_PRODUCER',
				transport: Transport.KAFKA,
				options: {
					client: {
						brokers: ['kafka:29092'],
						retry: {
							initialRetryTime: 3000,
							retries: 10,
						},
					},
					producer: {
						allowAutoTopicCreation: true,
					},
					consumer: {
						groupId: 'ecommerce-seeder-client',
						fromBeginning: true,
					},
				},
			},
		]),
	],
	exports: [ClientsModule],
})
export class KafkaModule {}
