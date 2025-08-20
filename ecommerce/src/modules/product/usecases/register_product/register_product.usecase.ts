import UseCaseInterface from '@shared/usecase/usecase.interface';
import {
	IRegisterProductUsecaseInputDTO,
	IRegisterProductUsecaseOutputDTO,
} from './register_product.usecase.dto';
import Product from '../../entity/product.entity';
import { Result, failure, success } from '@shared/result/result';
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from '@shared/errors/domain_errors';
import { PrismaService } from '@database/prisma.service';

export class RegisterProductUsecase
	implements
		UseCaseInterface<
			IRegisterProductUsecaseInputDTO,
			Result<IRegisterProductUsecaseOutputDTO, DomainError>
		>
{
	constructor(private prisma: PrismaService) {}

	async execute(
		input: IRegisterProductUsecaseInputDTO,
	): Promise<Result<IRegisterProductUsecaseOutputDTO, DomainError>> {
		const seller = await this.prisma.user.findUnique({
			where: {
				id: input.sellerId,
			},
		});

		if (!seller) {
			return failure(new NotFoundError('Seller'));
		}

		const productAlreadyRegistered = await this.prisma.product.findFirst({
			where: {
				name: input.name,
				sellerId: input.sellerId,
			},
		});

		if (productAlreadyRegistered) {
			return failure(
				new ConflictError(
					'Product with this name already registered by this seller',
				),
			);
		}

		const product = new Product(
			input.name,
			input.description,
			input.price,
			input.sellerId,
		);

		try {
			const createdProduct = await this.prisma.product.create({
				data: {
					id: product.id,
					name: product.name,
					price: product.price,
					description: product.description,
					sellerId: product.sellerId,
				},
			});

			return success({
				id: createdProduct.id,
				name: createdProduct.name,
				price: createdProduct.price,
				description: createdProduct.description ?? '',
				sellerId: createdProduct.sellerId,
			});
		} catch (error) {
			console.error('Unexpected error registering product:', error);
			throw new Error('Failed to register product due to an unexpected error.');
		}
	}
}
