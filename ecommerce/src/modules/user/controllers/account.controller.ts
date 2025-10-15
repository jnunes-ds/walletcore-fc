/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UpdateUserBalanceUsecase } from '../usecases/update_user_balance/update-user-balance.usecase';

@Controller()
export class AccountController {
	private readonly logger = new Logger(AccountController.name);

	constructor(
		private readonly updateUserBalanceUsecase: UpdateUserBalanceUsecase,
	) {}

	@EventPattern('account_created')
	async handleAccountCreated(@Payload() message: any) {
		this.logger.log(
			`Received event on 'account_created' topic. Full message: ${JSON.stringify(
				message,
			)}`,
		);

		// Validação defensiva da estrutura da mensagem
		if (!message || !message.Payload || !message.Payload.user_id) {
			this.logger.error(
				'Invalid or incomplete message structure received on account_created topic',
				JSON.stringify(message),
			);
			return;
		}

		this.logger.log(
			`Processing account_created event for user ${message.Payload.user_id}`,
		);

		const result = await this.updateUserBalanceUsecase.execute({
			userId: message.Payload.user_id,
			balance: message.Payload.balance,
		});

		if (!result.isSuccess) {
			this.logger.error(
				`Failed to update balance for user ${message.Payload.user_id}. Reason: ${result.error.message}`,
				result.error.stack,
			);
		} else {
			this.logger.log(
				`Successfully processed balance update for user ${message.Payload.user_id}`,
			);
		}
	}
}
