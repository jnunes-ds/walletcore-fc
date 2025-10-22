/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '@database/prisma.service';
import { UpdateUserBalanceUsecase } from '../usecases/update_user_balance/update-user-balance.usecase';

interface TransactionPayload {
	id: string;
	account_id_from: string;
	account_id_to: string;
	user_id_from: string;
	user_id_to: string;
	amount: number;
}

interface KafkaMessage {
	Name: string;
	Payload: TransactionPayload;
}

@Controller()
export class TransactionController {
	private readonly logger = new Logger(TransactionController.name);

	constructor(
		private readonly prismaService: PrismaService,
		private readonly updateUserBalanceUsecase: UpdateUserBalanceUsecase,
	) {}

	@EventPattern('transactions')
	async handleTransaction(@Payload() rawMessage: any) {
		this.logger.log(
			`New message on 'transactions' topic: ${JSON.stringify(rawMessage)}`,
		);

		let message: KafkaMessage;
		try {
			message =
				typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
		} catch (e) {
			this.logger.error('Failed to parse Kafka message', {
				rawMessage,
				error: e.toString(),
			});
			return;
		}

		if (!message || !message.Payload) {
			this.logger.error('Invalid message structure: Payload is missing.', {
				parsedMessage: message,
			});
			return;
		}

		const { user_id_from, user_id_to, account_id_from, account_id_to, amount } =
			message.Payload;

		// Lógica de Fallback: Prioriza user_id, mas usa account_id se o primeiro estiver vazio.
		const fromId = user_id_from || account_id_from;
		const toId = user_id_to || account_id_to;

		if (!fromId || !toId || !amount) {
			this.logger.error(
				'Invalid transaction payload: Could not determine sender or receiver ID, or amount is missing.',
				message.Payload,
			);
			return;
		}

		this.logger.log(
			`Processing transaction: ${amount} from user ${fromId} to user ${toId}`,
		);

		try {
			// 1. Efetua o saque (withdraw) do usuário de origem
			this.logger.log(`Attempting to withdraw ${amount} from user ${fromId}`);
			const withdrawResult = await this.updateUserBalanceUsecase.execute({
				userId: fromId,
				amount: amount,
				type: 'decrement',
			});

			if (!withdrawResult.isSuccess) {
				this.logger.error(
					`Withdraw failed for user ${fromId}`,
					withdrawResult.error,
				);
			} else {
				this.logger.log(`Withdraw successful for user ${fromId}`);
			}

			// 2. Efetua o depósito (deposit) para o usuário de destino
			this.logger.log(`Attempting to deposit ${amount} to user ${toId}`);
			const depositResult = await this.updateUserBalanceUsecase.execute({
				userId: toId,
				amount: amount,
				type: 'increment',
			});

			if (!depositResult.isSuccess) {
				this.logger.error(
					`Deposit failed for user ${toId}`,
					depositResult.error,
				);
			} else {
				this.logger.log(`Deposit successful for user ${toId}`);
			}
		} catch (error) {
			this.logger.error(
				'An unexpected error occurred during transaction processing',
				error.stack,
			);
		}
	}
}
