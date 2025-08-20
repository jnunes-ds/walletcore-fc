/* eslint-disable @typescript-eslint/unbound-method */
import { CreateUserUsecase } from './create_user.usecase';
import { PrismaService } from '../../../../database/prisma.service';
import { ICreateUserInputDTO } from './create_user.usecase.dto';

describe('CreateUserUsecase', () => {
	let usecase: CreateUserUsecase;
	let prismaService: PrismaService;

	beforeEach(() => {
		prismaService = {
			user: {
				create: jest.fn(),
			},
		} as any;
		usecase = new CreateUserUsecase(prismaService);
	});

	it('should create a user successfully', async () => {
		const input: ICreateUserInputDTO = {
			name: 'John Doe',
			email: 'john.doe@example.com',
		};

		const createdUser = {
			id: 'some-uuid',
			name: 'John Doe',
			email: 'john.doe@example.com',
			isSeller: false,
		};

		(prismaService.user.create as jest.Mock).mockResolvedValue(createdUser);

		const result = await usecase.execute(input);

		expect(prismaService.user.create).toHaveBeenCalledWith({
			data: {
				id: expect.any(String),
				name: input.name,
				email: input.email,
				isSeller: false,
				products: {},
				sales: {},
				purchases: {},
			},
		});
		expect(result).toEqual({
			id: createdUser.id,
			name: createdUser.name,
			email: createdUser.email,
			isSeller: createdUser.isSeller,
		});
	});

	it('should throw an error if user creation fails', async () => {
		const input: ICreateUserInputDTO = {
			name: 'John Doe',
			email: 'john.doe@example.com',
		};

		const errorMessage = 'Database error';
		(prismaService.user.create as jest.Mock).mockRejectedValue(
			new Error(errorMessage),
		);

		await expect(usecase.execute(input)).rejects.toThrow('Error creating user');

		expect(prismaService.user.create).toHaveBeenCalledWith({
			data: {
				id: expect.any(String),
				name: input.name,
				email: input.email,
				isSeller: false,
				products: {},
				sales: {},
				purchases: {},
			},
		});
	});
});
