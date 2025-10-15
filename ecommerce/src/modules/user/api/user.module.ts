import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CreateUserUsecase } from '../usecases/create_user/create_user.usecase';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AccountController } from '../controllers/account.controller';
import { UpdateUserBalanceUsecase } from '../usecases/update_user_balance/update-user-balance.usecase';

@Module({
	imports: [
		ClientsModule.register([
			{
				name: 'KAFKA_PRODUCER',
				transport: Transport.KAFKA,
				options: {
					client: {
						clientId: 'ecommerce-producer',
						brokers: ['kafka:29092'],
					},
					consumer: {
						groupId: 'ecommerce-consumer',
					},
				},
			},
		]),
	],
	controllers: [UserController, AccountController],
	providers: [UserService, CreateUserUsecase, UpdateUserBalanceUsecase],
})
export class UserModule {}
