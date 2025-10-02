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
				},
			},
		]),
	],
	exports: [ClientsModule], // Exporta o ClientsModule para tornar o provider disponível
})
export class KafkaModule {}
