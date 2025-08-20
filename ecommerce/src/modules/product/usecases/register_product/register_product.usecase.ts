import UseCaseInterface from '../../../@shared/usecase/usecase.interface';
import {
	IRegisterProductUsecaseInputDTO,
	IRegisterProductUsecaseOutputDTO,
} from './register_product.usecase.dto';
import { PrismaService } from '../../../../database/prisma.service';
import Product from '../../entity/product.entity';

export class RegisterProductUsecase
	implements
		UseCaseInterface<
			IRegisterProductUsecaseInputDTO,
			IRegisterProductUsecaseOutputDTO
		>
{
	constructor(private productRepository: PrismaService) {}

	async execute(
		input: IRegisterProductUsecaseInputDTO,
	): Promise<IRegisterProductUsecaseOutputDTO> {
		try {
			const foundedUser = await this.productRepository.user.findUnique({
				where: {
					id: input.sellerId,
				},
			});

			if (!foundedUser) {
				throw new Error('There ara no user with the id provided');
			}

			const productAlreadyRegistered =
				await this.productRepository.product.findFirst({
					where: {
						name: input.name,
						sellerId: input.sellerId,
					},
				});

			if (productAlreadyRegistered) throw new Error('Product already exists');

			const product = new Product(
				input.name,
				input.description,
				input.price,
				input.sellerId,
			);

			const createdProduct = await this.productRepository.product.create({
				data: {
					id: product.id,
					name: product.name,
					price: product.price,
					description: product.description,
					sellerId: product.sellerId,
				},
			});

			return {
				id: createdProduct.id,
				name: createdProduct.name,
				price: createdProduct.price,
				description: createdProduct.description ?? '',
				sellerId: createdProduct.sellerId,
			};
		} catch (e) {
			console.error(e);
			throw new Error(e);
		}
	}
}
