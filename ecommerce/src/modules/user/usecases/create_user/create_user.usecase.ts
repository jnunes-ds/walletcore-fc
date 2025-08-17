import { PrismaService } from '../../../../database/prisma.service';
import { ICreateUserInputDTO, ICreateUserOtuputDTO } from './create_user.dto';
import User from '../../entity/user.entity';

export class CreateUserUsecase {
	constructor(private productRepository: PrismaService) {}

	async execute(input: ICreateUserInputDTO): Promise<ICreateUserOtuputDTO> {
		try {
			const user = new User(input.name, input.email);

			const userCreated = await this.productRepository.user.create({
				data: {
					id: user.id,
					name: user.name,
					email: user.email,
					isSeller: user.isSeller,
					products: {},
					sales: {},
					purchases: {},
				},
			});

			return {
				id: userCreated.id,
				name: userCreated.name,
				email: userCreated.email,
				isSeller: userCreated.isSeller,
			};
		} catch (error) {
			console.error(error);
			throw new Error('Error creating user');
		}
	}
}
