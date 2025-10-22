/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaService } from '@database/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import UseCaseInterface from '@shared/usecase/usecase.interface';
import { failure, Result, success } from '@shared/result/result';
import { DomainError, NotFoundError } from '@shared/errors/domain_errors';

export interface IUpdateUserBalanceInputDTO {
	userId: string;
	amount: number;
	type: 'increment' | 'decrement';
}

export type IUpdateUserBalanceOutputDTO = void;

@Injectable()
export class UpdateUserBalanceUsecase
	implements
		UseCaseInterface<
			IUpdateUserBalanceInputDTO,
			Result<IUpdateUserBalanceOutputDTO, DomainError>
		>
{
	private readonly logger = new Logger(UpdateUserBalanceUsecase.name);

	constructor(private readonly databaseService: PrismaService) {}

	async execute(
		input: IUpdateUserBalanceInputDTO,
	): Promise<Result<IUpdateUserBalanceOutputDTO, DomainError>> {
		const user = await this.databaseService.user.findUnique({
			where: { id: input.userId },
		});

		if (!user) {
			return failure(new NotFoundError('User not found'));
		}

		try {
			const updatedUser = await this.databaseService.user.update({
				where: { id: input.userId },
				data: {
					balance:
						input.type === 'increment'
							? {
									increment: input.amount,
								}
							: {
									decrement: input.amount,
								},
				},
			});

			this.logger.log(
				`Balance updated for user ${input.userId}. New balance: ${updatedUser.balance}`,
			);

			return success(undefined);
		} catch (error) {
			this.logger.error(
				`Unexpected error while updating user balance: ${error.message}`,
				error.stack,
			);
			throw error;
		}
	}
}
