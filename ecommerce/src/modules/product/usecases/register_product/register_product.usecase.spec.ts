/* eslint-disable @typescript-eslint/unbound-method */
import { RegisterProductUsecase } from './register_product.usecase';
import { PrismaService } from '../../../../database/prisma.service';
import { IRegisterProductUsecaseInputDTO } from './register_product.usecase.dto';
import { success, failure } from '../../../@shared/result/result';
import {
	ConflictError,
	NotFoundError,
} from '../../../@shared/errors/domain_errors';

describe('RegisterProductUsecase', () => {
	let usecase: RegisterProductUsecase;
	let prismaService: PrismaService;

	beforeEach(() => {
		prismaService = {
			user: {
				findUnique: jest.fn(),
			},
			product: {
				findFirst: jest.fn(),
				create: jest.fn(),
			},
		} as any;
		usecase = new RegisterProductUsecase(prismaService);
	});

	it('should register a product successfully', async () => {
		const input: IRegisterProductUsecaseInputDTO = {
			name: 'Test Product',
			description: 'Description of test product',
			price: 100,
			sellerId: 'seller-uuid',
		};

		const foundUser = {
			id: 'seller-uuid',
			name: 'Seller User',
			email: 'seller@example.com',
			isSeller: true,
		};

		const createdProduct = {
			id: 'product-uuid',
			name: 'Test Product',
			description: 'Description of test product',
			price: 100,
			sellerId: 'seller-uuid',
		};

		(prismaService.user.findUnique as jest.Mock).mockResolvedValue(foundUser);
		(prismaService.product.findFirst as jest.Mock).mockResolvedValue(null);
		(prismaService.product.create as jest.Mock).mockResolvedValue(
			createdProduct,
		);

		const result = await usecase.execute(input);

		expect(prismaService.user.findUnique).toHaveBeenCalledWith({
			where: {
				id: input.sellerId,
			},
		});
		expect(prismaService.product.findFirst).toHaveBeenCalledWith({
			where: {
				name: input.name,
				sellerId: input.sellerId,
			},
		});
		expect(prismaService.product.create).toHaveBeenCalledWith({
			data: {
				id: expect.any(String),
				name: input.name,
				description: input.description,
				price: input.price,
				sellerId: input.sellerId,
			},
		});
		expect(result).toEqual(
			success({
				id: createdProduct.id,
				name: createdProduct.name,
				description: createdProduct.description,
				price: createdProduct.price,
				sellerId: createdProduct.sellerId,
			}),
		);
	});

	it('should return a failure if the seller is not found', async () => {
		const input: IRegisterProductUsecaseInputDTO = {
			name: 'Test Product',
			description: 'Description of test product',
			price: 100,
			sellerId: 'non-existent-seller-uuid',
		};

		(prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

		const result = await usecase.execute(input);

		expect(result).toEqual(failure(new NotFoundError('Seller')));
		expect(prismaService.user.findUnique).toHaveBeenCalledWith({
			where: { id: input.sellerId },
		});
		expect(prismaService.product.findFirst).not.toHaveBeenCalled();
		expect(prismaService.product.create).not.toHaveBeenCalled();
	});

	it('should return a failure if the product already exists for the seller', async () => {
		const input: IRegisterProductUsecaseInputDTO = {
			name: 'Test Product',
			description: 'Description of test product',
			price: 100,
			sellerId: 'seller-uuid',
		};

		const foundUser = { id: 'seller-uuid' };
		const existingProduct = { id: 'product-uuid', ...input };

		(prismaService.user.findUnique as jest.Mock).mockResolvedValue(foundUser);
		(prismaService.product.findFirst as jest.Mock).mockResolvedValue(
			existingProduct,
		);

		const result = await usecase.execute(input);

		expect(result).toEqual(
			failure(
				new ConflictError(
					'Product with this name already registered by this seller',
				),
			),
		);
		expect(prismaService.product.findFirst).toHaveBeenCalledWith({
			where: { name: input.name, sellerId: input.sellerId },
		});
		expect(prismaService.product.create).not.toHaveBeenCalled();
	});

	it('should throw an error if database creation fails unexpectedly', async () => {
		const input: IRegisterProductUsecaseInputDTO = {
			name: 'Test Product',
			description: 'Description of test product',
			price: 100,
			sellerId: 'seller-uuid',
		};

		const foundUser = { id: 'seller-uuid' };

		(prismaService.user.findUnique as jest.Mock).mockResolvedValue(foundUser);
		(prismaService.product.findFirst as jest.Mock).mockResolvedValue(null);
		(prismaService.product.create as jest.Mock).mockRejectedValue(
			new Error('Database connection lost'),
		);

		await expect(usecase.execute(input)).rejects.toThrow(
			'Failed to register product due to an unexpected error.',
		);

		expect(prismaService.product.create).toHaveBeenCalledWith({
			data: {
				id: expect.any(String),
				name: input.name,
				description: input.description,
				price: input.price,
				sellerId: input.sellerId,
			},
		});
	});
});
