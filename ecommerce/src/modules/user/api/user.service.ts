import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserUsecase } from '@modules/user/usecases/create_user/create_user.usecase';
import { ConflictError } from '@shared/errors/domain_errors';

@Injectable()
export class UserService {
	constructor(private readonly createUserUsecase: CreateUserUsecase) {}

	async create(createUserDto: CreateUserDto) {
		const result = await this.createUserUsecase.execute({
			name: createUserDto.name,
			email: createUserDto.email,
			isSeller: createUserDto.isSeller,
		});

		if (!result.isSuccess) {
			const error = result.error;
			if (error instanceof ConflictError) {
				throw new ConflictException(error.message);
			}
			throw error;
		}

		return result.value;
	}
}
