import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserUsecase } from '@modules/user/usecases/create_user/create_user.usecase';
import { ConflictError } from '@shared/errors/domain_errors';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class UserService {
	constructor(
		private readonly createUserUsecase: CreateUserUsecase,
		private readonly prismaService: PrismaService, // Injetando o PrismaService
	) {}

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

	async getBalance(accountId: string): Promise<{ balance: number }> {
		const user = await this.prismaService.user.findUnique({
			where: { id: accountId },
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return { balance: user.balance };
	}
}
