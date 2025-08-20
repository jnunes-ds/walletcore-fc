import {
	ICreateUserInputDTO,
	ICreateUserOtuputDTO,
} from './create_user.usecase.dto';
import { PrismaService } from '@database/prisma.service';
import User from '@modules/user/entity/user.entity';
import UseCaseInterface from '@shared/usecase/usecase.interface';
import { failure, Result, success } from '@shared/result/result';
import { ConflictError, DomainError } from '@shared/errors/domain_errors';

export class CreateUserUsecase
	implements
		UseCaseInterface<
			ICreateUserInputDTO,
			Result<ICreateUserOtuputDTO, DomainError>
		>
{
	constructor(private prisma: PrismaService) {}

	async execute(
		input: ICreateUserInputDTO,
	): Promise<Result<ICreateUserOtuputDTO, DomainError>> {
		const emailInUse = await this.prisma.user.findUnique({
			where: { email: input.email },
		});

		if (emailInUse) {
			return failure(new ConflictError('Email already in use'));
		}

		const user = new User(input.name, input.email);

		try {
			const userCreated = await this.prisma.user.create({
				data: {
					id: user.id,
					name: user.name,
					email: user.email,
					isSeller: user.isSeller,
				},
			});

			return success({
				id: userCreated.id,
				name: userCreated.name,
				email: userCreated.email,
				isSeller: userCreated.isSeller,
			});
		} catch (error) {
			throw new Error(error);
		}
	}
}
