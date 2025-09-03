//crie testes para o usecase de listagem de todos os produtos
/* eslint-disable @typescript-eslint/unbound-method */
import { ListAllProductsUsecase } from './list_all.usecase';
import { PrismaService } from '@database/prisma.service';
import { success } from '@shared/result/result';

describe('ListAllProductsUsecase', () => {
	let usecase: ListAllProductsUsecase;
	let prismaService: PrismaService;

	beforeEach(() => {
		prismaService = {
			product: {
				findMany: jest.fn(),
			},
		} as any;
		usecase = new ListAllProductsUsecase(prismaService);
	});

	it('should return an empty array if no products are found', async () => {
		(prismaService.product.findMany as jest.Mock).mockResolvedValue([]);

		const result = await usecase.execute();

		expect(prismaService.product.findMany).toHaveBeenCalledWith();
		expect(result).toEqual(success([]));
	});

	it('should return a list of products if products are found', async () => {
		const products = [
			{
				id: 'product-uuid-1',
				name: 'Product 1',
				description: 'Description 1',
				price: 100,
				sellerId: 'seller-uuid-1',
			},
			{
				id: 'product-uuid-2',
				name: 'Product 2',
				description: 'Description 2',
				price: 200,
				sellerId: 'seller-uuid-1',
			},
		];
		(prismaService.product.findMany as jest.Mock).mockResolvedValue(products);

		const result = await usecase.execute();

		expect(prismaService.product.findMany).toHaveBeenCalledWith();
		expect(result).toEqual(success(products));
	});

	it('should throw an error if database query fails', async () => {
		(prismaService.product.findMany as jest.Mock).mockRejectedValue(
			new Error('Database connection lost'),
		);

		await expect(usecase.execute()).rejects.toThrow('Database connection lost');
		expect(prismaService.product.findMany).toHaveBeenCalledWith();
	});
});
