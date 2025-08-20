import { PrismaService } from '@database/prisma.service';
import Purchase from '@modules/purchase/entity/purchase.entity';
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from '@shared/errors/domain_errors';
import { Result, failure, success } from '@shared/result/result';
import UseCaseInterface from '@shared/usecase/usecase.interface';
import {
	PurchaseProductUsecaseInputDTO,
	PurchaseProductUsecaseOutputDTO,
} from './purchase_product.usecase.dto';

export class PurchaseProductUsecase
	implements
		UseCaseInterface<
			PurchaseProductUsecaseInputDTO,
			Result<PurchaseProductUsecaseOutputDTO, DomainError>
		>
{
	constructor(private prisma: PrismaService) {}

	async execute(
		input: PurchaseProductUsecaseInputDTO,
	): Promise<Result<PurchaseProductUsecaseOutputDTO, DomainError>> {
		const buyer = await this.prisma.user.findUnique({
			where: {
				id: input.buyerId,
			},
		});

		if (!buyer) {
			return failure(new NotFoundError('Buyer'));
		}

		const seller = await this.prisma.user.findUnique({
			where: {
				id: input.sellerId,
			},
		});

		if (!seller) {
			return failure(new NotFoundError('Seller'));
		}

		const product = await this.prisma.product.findUnique({
			where: {
				id: input.productId,
			},
		});

		if (!product) {
			return failure(new NotFoundError('Product'));
		}

		if (product.sellerId === input.buyerId) {
			return failure(
				new ConflictError('A user cannot purchase their own product.'),
			);
		}

		const purchase = new Purchase(
			null,
			input.buyerId,
			input.sellerId,
			input.productId,
			product.price,
		);

		try {
			const createdPurchase = await this.prisma.purchase.create({
				data: {
					id: purchase.id,
					buyerId: purchase.buyerId,
					sellerId: purchase.sellerId,
					productId: purchase.productId,
					price: purchase.price,
				},
			});

			return success({
				id: createdPurchase.id,
				buyerId: createdPurchase.buyerId,
				sellerId: createdPurchase.sellerId,
				price: createdPurchase.price,
				createdAt: createdPurchase.createdAt,
				products: [createdPurchase.productId],
			});
		} catch (error) {
			console.error('Unexpected error during purchase creation:', error);
			throw new Error(
				'Failed to complete purchase due to an unexpected error.',
			);
		}
	}
}
