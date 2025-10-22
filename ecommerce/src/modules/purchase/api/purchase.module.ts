import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PurchaseProductUsecase } from '@modules/purchase/usecases/purchase_product/purchase_product.usecase';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
	imports: [
		ClientsModule.register([
			{
				name: 'KAFKA_PRODUCER',
				transport: Transport.KAFKA,
				options: {
					client: {
						clientId: 'ecommerce-producer-purchase', // Unique client ID
						brokers: ['kafka:29092'],
					},
					producer: {
						allowAutoTopicCreation: true,
					},
				},
			},
		]),
	],
	controllers: [PurchaseController],
	providers: [PurchaseService, PurchaseProductUsecase],
})
export class PurchaseModule {}
