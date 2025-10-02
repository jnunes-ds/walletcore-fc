import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@database/prisma.module';
import { KafkaModule } from './kafka/kafka.module';
import { CreateUserUsecase } from '@modules/user/usecases/create_user/create_user.usecase';
import { RegisterProductUsecase } from '@modules/product/usecases/register_product/register_product.usecase';
import { PurchaseProductUsecase } from '@modules/purchase/usecases/purchase_product/purchase_product.usecase';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		KafkaModule,
	],
	providers: [
		CreateUserUsecase,
		RegisterProductUsecase,
		PurchaseProductUsecase,
	],
	exports: [CreateUserUsecase, RegisterProductUsecase, PurchaseProductUsecase],
})
export class SeederModule {}
