import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserUsecase } from '@modules/user/usecases/create_user/create_user.usecase';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class UserService {
	async create(createUserDto: CreateUserDto) {
		const databaseService = new PrismaService();
		const usecase = new CreateUserUsecase(databaseService);
		await usecase.execute({
			name: createUserDto.name,
			email: createUserDto.email,
		});
	}
}
