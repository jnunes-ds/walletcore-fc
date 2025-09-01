import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@database/prisma.module';
import { UserModule } from '@modules/user/api/user.module';
import { ProductModule } from '@modules/product/api/product.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule, // Importe o PrismaModule global uma vez aqui
		UserModule,
		ProductModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
