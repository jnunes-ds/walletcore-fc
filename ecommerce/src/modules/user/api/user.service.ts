import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserUsecase } from '@modules/user/usecases/create_user/create_user.usecase';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class UserService {
	constructor(private readonly databaseService: PrismaService) {}
	async create(createUserDto: CreateUserDto) {
		const usecase = new CreateUserUsecase(this.databaseService);

		await usecase.execute({
			name: createUserDto.name,
			email: createUserDto.email,
		});
	}
}
