/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '@database/prisma.service';
import { UpdateUserBalanceUsecase } from '../usecases/update_user_balance/update-user-balance.usecase';

// Interface para o Payload da mensagem, conforme a estrutura do evento Kafka
interface TransactionPayload {
	id: string;
	account_id_from: string;
	account_id_to: string;
	user_id_from: string; // ID do usuário que envia
	user_id_to: string; // ID do usuário que recebe
	amount: number; // Valor da transação
}

// Interface para a mensagem completa do Kafka
interface KafkaMessage {
	Name: string;
	Payload: TransactionPayload;
}

@Controller()
export class TransactionController {
	private readonly logger = new Logger(TransactionController.name);

	constructor(
		private readonly prismaService: PrismaService, // Para buscar os usuários
		private readonly updateUserBalanceUsecase: UpdateUserBalanceUsecase, // Para atualizar os saldos
	) {}

	@EventPattern('transactions')
	async handleTransaction(@Payload() rawMessage: any) {
		this.logger.log(
			`New message on 'transactions' topic: ${JSON.stringify(rawMessage)}`,
		);

		let message: KafkaMessage;
		try {
			// Garante que a mensagem seja um objeto, fazendo o parse se for uma string
			message =
				typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
		} catch (e) {
			this.logger.error('Failed to parse Kafka message', {
				rawMessage,
				error: e.toString(),
			});
			return;
		}

		// Valida a estrutura básica da mensagem
		if (!message || !message.Payload) {
			this.logger.error('Invalid message structure: Payload is missing.', {
				parsedMessage: message,
			});
			return;
		}

		// Extrai os campos EXATAMENTE como instruído
		const { user_id_from, user_id_to, amount } = message.Payload;

		// Valida que os campos necessários existem e não são vazios.
		// Se user_id_from ou user_id_to forem "", a transação é inválida.
		if (!user_id_from || !user_id_to || !amount) {
			this.logger.error(
				'Invalid transaction payload: required fields (user_id_from, user_id_to, amount) are missing or empty.',
				message.Payload,
			);
			return;
		}

		this.logger.log(
			`Processing transaction: ${amount} from user ${user_id_from} to user ${user_id_to}`,
		);

		try {
			// Passo 1 e 2: Buscar e sacar (withdraw) do usuário de origem
			this.logger.log(
				`Attempting to withdraw ${amount} from user ${user_id_from}`,
			);
			const withdrawResult = await this.updateUserBalanceUsecase.execute({
				userId: user_id_from,
				amount: -amount, // Usa um valor negativo para o saque
			});

			if (!withdrawResult.isSuccess) {
				this.logger.error(
					`Withdraw failed for user ${user_id_from}`,
					withdrawResult.error,
				);
			} else {
				this.logger.log(`Withdraw successful for user ${user_id_from}`);
			}

			// Passo 3 e 4: Buscar e depositar para o usuário de destino
			this.logger.log(`Attempting to deposit ${amount} to user ${user_id_to}`);
			const depositResult = await this.updateUserBalanceUsecase.execute({
				userId: user_id_to,
				amount: amount, // Usa um valor positivo para o depósito
			});

			if (!depositResult.isSuccess) {
				this.logger.error(
					`Deposit failed for user ${user_id_to}`,
					depositResult.error,
				);
				// OBS: Em um sistema real, seria crucial ter uma lógica para reverter o saque se o depósito falhar.
			} else {
				this.logger.log(`Deposit successful for user ${user_id_to}`);
			}
		} catch (error) {
			this.logger.error(
				'An unexpected error occurred during transaction processing',
				error.stack,
			);
		}
	}
}
