import { Module } from '@nestjs/common';
import { CreateUserUsecase } from '../usecases/create_user/create_user.usecase';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
	imports: [], // Removido o ClientsModule, pois agora é global
	controllers: [UserController],
	providers: [UserService, CreateUserUsecase],
})
export class UserModule {}
