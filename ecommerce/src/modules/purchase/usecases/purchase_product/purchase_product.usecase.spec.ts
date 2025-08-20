/* eslint-disable @typescript-eslint/unbound-method */
import { PurchaseProductUsecase } from './purchase_product.usecase';
import { PrismaService } from '../../../../database/prisma.service';
import { PurchaseProductUsecaseInputDTO } from './purchase_product.usecase.dto';
import { NotFoundError } from '../../../@shared/errors/domain_errors';
import { failure } from '../../../@shared/result/result';

describe('PurchaseProductUsecase', () => {
	let usecase: PurchaseProductUsecase;
	let prismaService: PrismaService;

	beforeEach(() => {
		prismaService = {
			user: {
				findUnique: jest.fn(),
			},
			product: {
				findUnique: jest.fn(),
			},
			purchase: {
				create: jest.fn(),
			},
		} as any;
		usecase = new PurchaseProductUsecase(prismaService);
	});

	it('should purchase a product successfully', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: 'buyer-uuid',
			sellerId: 'seller-uuid',
			productId: 'product-uuid',
		};

		const foundBuyer = {
			id: 'buyer-uuid',
			name: 'Buyer User',
			email: 'buyer@example.com',
			isSeller: false,
		};

		const foundSeller = {
			id: 'seller-uuid',
			name: 'Seller User',
			email: 'seller@example.com',
			isSeller: true,
		};

		const foundProduct = {
			id: 'product-uuid',
			name: 'Test Product',
			description: 'Description of test product',
			price: 100,
			sellerId: 'seller-uuid',
		};

		const createdPurchase = {
			id: 'purchase-uuid',
			buyerId: 'buyer-uuid',
			sellerId: 'seller-uuid',
			productId: 'product-uuid',
			price: 100,
			createdAt: new Date(),
		};

		(prismaService.user.findUnique as jest.Mock)
			.mockResolvedValueOnce(foundBuyer)
			.mockResolvedValueOnce(foundSeller);
		(prismaService.product.findUnique as jest.Mock).mockResolvedValue(
			foundProduct,
		);
		(prismaService.purchase.create as jest.Mock).mockResolvedValue(
			createdPurchase,
		);
		const result = await usecase.execute(input);

		expect(prismaService.user.findUnique).toHaveBeenCalledTimes(2);
		expect(prismaService.user.findUnique).toHaveBeenCalledWith({
			where: {
				id: input.buyerId,
			},
		});
		expect(prismaService.user.findUnique).toHaveBeenCalledWith({
			where: {
				id: input.sellerId,
			},
		});
		expect(prismaService.product.findUnique).toHaveBeenCalledWith({
			where: {
				id: input.productId,
			},
		});
		expect(prismaService.purchase.create).toHaveBeenCalledWith({
			data: {
				id: expect.any(String),
				buyerId: input.buyerId,
				sellerId: input.sellerId,
				productId: input.productId,
				price: foundProduct.price,
			},
		});
		expect(result).toEqual({
			isSuccess: true,
			value: {
				id: createdPurchase.id,
				buyerId: createdPurchase.buyerId,
				sellerId: createdPurchase.sellerId,
				products: [createdPurchase.productId],
				price: createdPurchase.price,
				createdAt: createdPurchase.createdAt,
			},
		});
	});

	it('should throw an error if buyer is not found', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: 'buyer-uuid',
			sellerId: 'seller-uuid',
			productId: 'product-uuid',
		};

		(prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

		await expect(usecase.execute(input)).resolves.toEqual({
			isSuccess: false,
			error: new NotFoundError('Buyer'),
		});
		expect(prismaService.user.findUnique).toHaveBeenCalledWith({
			where: {
				id: input.buyerId,
			},
		});
	});

	it('should throw an error if seller is not found', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: 'buyer-uuid',
			sellerId: 'seller-uuid',
			productId: 'product-uuid',
		};

		const foundBuyer = {
			id: 'buyer-uuid',
			name: 'Buyer User',
			email: 'buyer@example.com',
			isSeller: false,
		};

		(prismaService.user.findUnique as jest.Mock)
			.mockResolvedValueOnce(foundBuyer)
			.mockResolvedValueOnce(null);
		await expect(usecase.execute(input)).resolves.toEqual(
			failure(new NotFoundError('Seller')),
		);
		expect(prismaService.user.findUnique).toHaveBeenCalledTimes(2);
		expect(prismaService.user.findUnique).toHaveBeenCalledWith({
			where: {
				id: input.sellerId,
			},
		});
	});

	it('should throw an error if product is not found', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: 'buyer-uuid',
			sellerId: 'seller-uuid',
			productId: 'product-uuid',
		};

		const foundBuyer = {
			id: 'buyer-uuid',
			name: 'Buyer User',
			email: 'buyer@example.com',
			isSeller: false,
		};

		const foundSeller = {
			id: 'seller-uuid',
			name: 'Seller User',
			email: 'seller@example.com',
			isSeller: true,
		};

		(prismaService.user.findUnique as jest.Mock)
			.mockResolvedValueOnce(foundBuyer)
			.mockResolvedValueOnce(foundSeller);
		(prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

		await expect(usecase.execute(input)).resolves.toEqual(
			failure(new NotFoundError('Product')),
		);
		expect(prismaService.product.findUnique).toHaveBeenCalledWith({
			where: {
				id: input.productId,
			},
		});
	});

	it('should throw an error if purchase creation fails', async () => {
		const input: PurchaseProductUsecaseInputDTO = {
			buyerId: 'buyer-uuid',
			sellerId: 'seller-uuid',
			productId: 'product-uuid',
		};

		const foundBuyer = {
			id: 'buyer-uuid',
			name: 'Buyer User',
			email: 'buyer@example.com',
			isSeller: false,
		};

		const foundSeller = {
			id: 'seller-uuid',
			name: 'Seller User',
			email: 'seller@example.com',
			isSeller: true,
		};

		const foundProduct = {
			id: 'product-uuid',
			name: 'Test Product',
			description: 'Description of test product',
			price: 100,
			sellerId: 'seller-uuid',
		};

		(prismaService.user.findUnique as jest.Mock)
			.mockResolvedValueOnce(foundBuyer)
			.mockResolvedValueOnce(foundSeller);
		(prismaService.product.findUnique as jest.Mock).mockResolvedValue(
			foundProduct,
		);
		(prismaService.purchase.create as jest.Mock).mockRejectedValue(
			new Error('Database error'),
		);

		await expect(usecase.execute(input)).rejects.toThrow('Database error');
		expect(prismaService.purchase.create).toHaveBeenCalledWith({
			data: {
				id: expect.any(String),
				buyerId: input.buyerId,
				sellerId: input.sellerId,
				productId: input.productId,
				price: foundProduct.price,
			},
		});
	});
});
