/* eslint-disable @typescript-eslint/unbound-method */
import { RegisterProductUsecase } from './register_product.usecase';
import { PrismaService } from '../../../../database/prisma.service';
import { IRegisterProductUsecaseInputDTO } from './register_product.usecase.dto';

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
		expect(result).toEqual({
			id: createdProduct.id,
			name: createdProduct.name,
			description: createdProduct.description,
			price: createdProduct.price,
			sellerId: createdProduct.sellerId,
		});
	});
});
