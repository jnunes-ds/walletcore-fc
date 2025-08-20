import UseCaseInterface from '../../../@shared/usecase/usecase.interface';
import {
	PurchaseProductUsecaseInputDTO,
	PurchaseProductUsecaseOutputDTO,
} from './purchase_product.usecase.dto';
import { PrismaService } from '../../../../database/prisma.service';
import Purchase from '../../entity/purchase.entity';

export class PurchaseProductUsecase
	implements
		UseCaseInterface<
			PurchaseProductUsecaseInputDTO,
			PurchaseProductUsecaseOutputDTO
		>
{
	constructor(private productRepository: PrismaService) {}

	async execute(
		input: PurchaseProductUsecaseInputDTO,
	): Promise<PurchaseProductUsecaseOutputDTO> {
		try {
			const buyer = await this.productRepository.user.findUnique({
				where: {
					id: input.buyerId,
				},
			});

			if (!buyer) throw new Error('Buyer not found');

			const seller = await this.productRepository.user.findUnique({
				where: {
					id: input.sellerId,
				},
			});

			if (!seller) throw new Error('Seller not found');

			const product = await this.productRepository.product.findUnique({
				where: {
					id: input.productId,
				},
			});

			if (!product) throw new Error('Product not found');

			const purchase = new Purchase(
				null,
				input.buyerId,
				input.sellerId,
				input.productId,
				product.price,
			);

			const createdPurchase = await this.productRepository.purchase.create({
				data: {
					id: purchase.id,
					buyerId: purchase.buyerId,
					sellerId: purchase.sellerId,
					productId: purchase.productId,
					price: purchase.price,
				},
			});

			return {
				id: createdPurchase.id,
				buyerId: createdPurchase.buyerId,
				sellerId: createdPurchase.sellerId,
				products: [createdPurchase.productId],
			};
		} catch (e) {
			throw new Error(e);
		}
	}
}
