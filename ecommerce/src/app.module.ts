import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@modules/user/api/user.module';
import { ProductModule } from '@modules/product/api/product.module';
import { PurchaseModule } from '@modules/purchase/api/purchase.module';

@Module({
	imports: [
		// Configura o ConfigModule para ser global, lendo o arquivo .env
		ConfigModule.forRoot({ isGlobal: true }),
		UserModule,
		ProductModule,
		PurchaseModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
