/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access */
import {
	ICreateUserInputDTO,
	ICreateUserOtuputDTO,
} from './create_user.usecase.dto';
import { PrismaService } from '@database/prisma.service';
import User from '@modules/user/entity/user.entity';
import { Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
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
	private readonly logger = new Logger(CreateUserUsecase.name);

	constructor(
		private readonly databaseService: PrismaService,
		@Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
	) {}

	async execute(
		input: ICreateUserInputDTO,
	): Promise<Result<ICreateUserOtuputDTO, DomainError>> {
		const emailInUse = await this.databaseService.user.findUnique({
			where: { email: input.email },
		});

		if (emailInUse) {
			return failure(new ConflictError('Email already in use'));
		}

		const user = new User(input.name, input.email);

		try {
			const userCreated = await this.databaseService.user.create({
				data: {
					id: user.id,
					name: user.name,
					email: user.email,
					isSeller: user.isSeller,
				},
			});
			this.kafkaClient.emit('user_created', userCreated).subscribe({
				error: (err) => {
					this.logger.error(
						`Failed to emit user_created event for user ${userCreated.id}.`,
						err.stack,
					);
				},
			});

			return success({
				id: userCreated.id,
				name: userCreated.name,
				email: userCreated.email,
				isSeller: userCreated.isSeller,
			});
		} catch (error) {
			this.logger.error(
				`Unexpected error while creating user: ${error.message}`,
				error.stack,
			);
			throw error;
		}
	}
}
