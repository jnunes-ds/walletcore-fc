import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CreateUserUsecase } from '../usecases/create_user/create_user.usecase';
import { UserService } from './user.service';
import { PrismaService } from '@database/prisma.service';
import { UserController } from './user.controller';

@Module({
	imports: [
		ClientsModule.register([
			{
				// Este 'name' é o token de injeção que usaremos para injetar o cliente.
				name: 'KAFKA_PRODUCER',
				transport: Transport.KAFKA,
				options: {
					client: {
						brokers: ['kafka:29092'],
						// Adiciona lógica de retry para tornar a conexão mais robusta
						retry: {
							initialRetryTime: 300,
							retries: 8,
						},
					},
				},
			},
		]),
	],
	controllers: [UserController],
	providers: [UserService, CreateUserUsecase, PrismaService],
})
export class UserModule {}
