/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
	IRegisterProductUsecaseInputDTO,
	IRegisterProductUsecaseOutputDTO,
} from './register_product.usecase.dto';
import { PrismaService } from '@database/prisma.service';
import Product from '@modules/product/entity/product.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import UseCaseInterface from '@shared/usecase/usecase.interface';
import { failure, Result, success } from '@shared/result/result';
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from '@shared/errors/domain_errors';

@Injectable()
export class RegisterProductUsecase
	implements
		UseCaseInterface<
			IRegisterProductUsecaseInputDTO,
			Result<IRegisterProductUsecaseOutputDTO, DomainError>
		>
{
	private readonly logger = new Logger(RegisterProductUsecase.name);

	constructor(
		private readonly databaseService: PrismaService,
		@Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
	) {}

	async execute(
		input: IRegisterProductUsecaseInputDTO,
	): Promise<Result<IRegisterProductUsecaseOutputDTO, DomainError>> {
		const sellerExists = await this.databaseService.user.findUnique({
			where: { id: input.sellerId },
		});

		if (!sellerExists) {
			return failure(new NotFoundError('Seller'));
		}

		const productExists = await this.databaseService.product.findFirst({
			where: { name: input.name, sellerId: input.sellerId },
		});

		if (productExists) {
			return failure(
				new ConflictError(
					'Product with this name already registered by this seller',
				),
			);
		}

		const product = new Product(input);

		try {
			const productCreated = await this.databaseService.product.create({
				data: { ...product },
			});

			this.kafkaClient.emit('product_registered', productCreated).subscribe({
				error: (err) => {
					this.logger.error(
						`Failed to emit product_registered event for product ${productCreated.id}.`,
						err.stack,
					);
				},
			});

			return success(productCreated);
		} catch (error) {
			this.logger.error(
				`Unexpected error while registering product: ${error.message}`,
				error.stack,
			);
			return failure(error);
		}
	}
}
