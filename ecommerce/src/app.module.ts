import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@database/prisma.module';
import { UserModule } from '@modules/user/api/user.module';
import { ProductModule } from '@modules/product/api/product.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule } from './kafka/kafka.module';
import { PurchaseModule } from '@modules/purchase/api/purchase.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		UserModule,
		ProductModule,
		PurchaseModule,
		KafkaModule, // Adiciona o KafkaModule global
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
