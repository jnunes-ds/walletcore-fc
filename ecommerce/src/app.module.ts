import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@database/prisma.module';
import { UserModule } from '@modules/user/api/user.module';
import { ProductModule } from '@modules/product/api/product.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		UserModule,
		ProductModule,
		ClientsModule.register([
			{
				name: 'KAFKA_PRODUCER',
				transport: Transport.KAFKA,
				options: {
					client: {
						brokers: ['kafka:29092'],
					},
					producer: {
						allowAutoTopicCreation: true,
					},
				},
			},
		]),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
