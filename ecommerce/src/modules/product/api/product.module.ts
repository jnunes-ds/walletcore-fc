import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RegisterProductUsecase } from '@modules/product/usecases/register_product/register_product.usecase';

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
							initialRetryTime: 300,
							retries: 8,
						},
					},
				},
			},
		]),
	],
	controllers: [ProductController],
	providers: [ProductService, RegisterProductUsecase],
})
export class ProductModule {}
