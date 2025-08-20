/* eslint-disable @typescript-eslint/unbound-method */
import { CreateUserUsecase } from './create_user.usecase';
import { PrismaService } from '../../../../database/prisma.service';
import { ICreateUserInputDTO } from './create_user.usecase.dto';
import { success, failure } from '../../../@shared/result/result';
import { ConflictError } from '../../../@shared/errors/domain_errors';

describe('CreateUserUsecase', () => {
	let usecase: CreateUserUsecase;
	let prismaService: PrismaService;

	beforeEach(() => {
		prismaService = {
			user: {
				create: jest.fn(),
				findUnique: jest.fn(),
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

		(prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
		(prismaService.user.create as jest.Mock).mockResolvedValue(createdUser);

		const result = await usecase.execute(input);

		expect(prismaService.user.findUnique).toHaveBeenCalledWith({
			where: { email: input.email },
		});
		expect(prismaService.user.create).toHaveBeenCalledWith({
			data: {
				id: expect.any(String),
				name: input.name,
				email: input.email,
				isSeller: false,
			},
		});
		expect(result).toEqual(success(createdUser));
	});

	it('should return a failure result if email is already in use', async () => {
		const input: ICreateUserInputDTO = {
			name: 'John Doe',
			email: 'john.doe@example.com',
		};

		const existingUser = { id: 'some-id', ...input, isSeller: false };
		(prismaService.user.findUnique as jest.Mock).mockResolvedValue(
			existingUser,
		);

		const result = await usecase.execute(input);

		expect(result).toEqual(failure(new ConflictError('Email already in use')));
		expect(prismaService.user.findUnique).toHaveBeenCalledWith({
			where: { email: input.email },
		});
		expect(prismaService.user.create).not.toHaveBeenCalled();
	});

	it('should throw an error if database creation fails unexpectedly', async () => {
		const input: ICreateUserInputDTO = {
			name: 'John Doe',
			email: 'john.doe@example.com',
		};

		(prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
		(prismaService.user.create as jest.Mock).mockRejectedValue(
			new Error('Database connection lost'),
		);

		await expect(usecase.execute(input)).rejects.toThrow(
			'Database connection lost',
		);

		expect(prismaService.user.create).toHaveBeenCalledWith({
			data: {
				id: expect.any(String),
				name: input.name,
				email: input.email,
				isSeller: false,
			},
		});
	});
});
