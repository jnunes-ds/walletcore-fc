import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@database/prisma.module';
import { UserModule } from '@modules/user/api/user.module';
import { ProductModule } from '@modules/product/api/product.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule, // Importe o PrismaModule global uma vez aqui
		UserModule,
		ProductModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
