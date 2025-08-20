/* eslint-disable @typescript-eslint/unbound-method */
import { PrismaService } from '@database/prisma.service';
import { ConflictError, NotFoundError } from '@shared/errors/domain_errors';
import { failure, success } from '@shared/result/result';
import { PurchaseProductUsecase } from './purchase_product.usecase';
import { PurchaseProductUsecaseInputDTO } from './purchase_product.usecase.dto';

describe('PurchaseProductUsecase', () => {
	let usecase: PurchaseProductUsecase;
	let prismaService: PrismaService;

	const buyer = { id: 'buyer-uuid', name: 'Buyer', email: 'buyer@test.com' };
	const seller = {
		id: 'seller-uuid',
		name: 'Seller',
		email: 'seller@test.com',
	};
	const product = {
		id: 'product-uuid',
		name: 'Test Product',
		price: 100,
		sellerId: seller.id,
	};

	beforeEach(() => {
		prismaService = {
			user: { findUnique: jest.fn() },
			product: { findUnique: jest.fn() },
			purchase: { create: jest.fn() },
		} as any;
		usecase = new PurchaseProductUsecase(prismaService);
	});

	it('should successfully purchase a product', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: buyer.id,
			sellerId: seller.id,
			productId: product.id,
		};

		const createdPurchase = {
			...input,
			id: 'purchase-uuid',
			price: product.price,
			createdAt: new Date(),
		};

		(prismaService.user.findUnique as jest.Mock)
			.mockResolvedValueOnce(buyer)
			.mockResolvedValueOnce(seller);
		(prismaService.product.findUnique as jest.Mock).mockResolvedValue(product);
		(prismaService.purchase.create as jest.Mock).mockResolvedValue(
			createdPurchase,
		);

		const result = await usecase.execute(input);

		expect(result).toEqual(success(createdPurchase));
		expect(prismaService.purchase.create).toHaveBeenCalledWith({
			data: {
				id: expect.any(String),
				buyerId: input.buyerId,
				sellerId: input.sellerId,
				productId: input.productId,
				price: product.price,
			},
		});
	});

	it('should return a failure if buyer is not found', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: 'non-existent-buyer',
			sellerId: seller.id,
			productId: product.id,
		};

		(prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

		const result = await usecase.execute(input);

		expect(result).toEqual(failure(new NotFoundError('Buyer')));
	});

	it('should return a failure if seller is not found', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: buyer.id,
			sellerId: 'non-existent-seller',
			productId: product.id,
		};

		(prismaService.user.findUnique as jest.Mock)
			.mockResolvedValueOnce(buyer)
			.mockResolvedValueOnce(null);

		const result = await usecase.execute(input);

		expect(result).toEqual(failure(new NotFoundError('Seller')));
	});

	it('should return a failure if product is not found', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: buyer.id,
			sellerId: seller.id,
			productId: 'non-existent-product',
		};

		(prismaService.user.findUnique as jest.Mock)
			.mockResolvedValueOnce(buyer)
			.mockResolvedValueOnce(seller);
		(prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

		const result = await usecase.execute(input);

		expect(result).toEqual(failure(new NotFoundError('Product')));
	});

	it('should return a failure if buyer is the same as the seller', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: seller.id, // Buyer is the seller
			sellerId: seller.id,
			productId: product.id,
		};

		(prismaService.user.findUnique as jest.Mock)
			.mockResolvedValueOnce(seller) // Finds buyer (who is the seller)
			.mockResolvedValueOnce(seller); // Finds seller
		(prismaService.product.findUnique as jest.Mock).mockResolvedValue(product);

		const result = await usecase.execute(input);

		expect(result).toEqual(
			failure(new ConflictError('A user cannot purchase their own product.')),
		);
	});

	it('should throw an error if database creation fails unexpectedly', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: buyer.id,
			sellerId: seller.id,
			productId: product.id,
		};

		(prismaService.user.findUnique as jest.Mock)
			.mockResolvedValueOnce(buyer)
			.mockResolvedValueOnce(seller);
		(prismaService.product.findUnique as jest.Mock).mockResolvedValue(product);
		(prismaService.purchase.create as jest.Mock).mockRejectedValue(
			new Error('DB connection error'),
		);

		await expect(usecase.execute(input)).rejects.toThrow(
			'Failed to complete purchase due to an unexpected error.',
		);
	});
});
