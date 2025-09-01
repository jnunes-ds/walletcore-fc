/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserUsecase } from '@modules/user/usecases/create_user/create_user.usecase';
import { ConflictException } from '@nestjs/common';
import { failure, success } from '@shared/result/result';
import { ConflictError } from '@shared/errors/domain_errors';

describe('UserService', () => {
	let service: UserService;
	let createUserUsecase: CreateUserUsecase;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: CreateUserUsecase,
					useValue: {
						execute: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
		createUserUsecase = module.get<CreateUserUsecase>(CreateUserUsecase);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should call the usecase and return its value on success', async () => {
		const dto = { name: 'Test', email: 'test@test.com' };
		const usecaseResult = { id: '1', ...dto, isSeller: false };
		(createUserUsecase.execute as jest.Mock).mockResolvedValue(
			success(usecaseResult),
		);

		const result = await service.create(dto);

		expect(createUserUsecase.execute).toHaveBeenCalledWith(dto);
		expect(result).toEqual(usecaseResult);
	});

	it('should throw ConflictException if usecase returns ConflictError', async () => {
		const dto = { name: 'Test', email: 'test@test.com' };
		(createUserUsecase.execute as jest.Mock).mockResolvedValue(
			failure(new ConflictError('Email in use')),
		);

		await expect(service.create(dto)).rejects.toThrow(ConflictException);
		await expect(service.create(dto)).rejects.toThrow('Email in use');
	});

	it('should re-throw other errors from the usecase', async () => {
		const dto = { name: 'Test', email: 'test@test.com' };
		const genericError = new Error('Something went wrong');
		(createUserUsecase.execute as jest.Mock).mockResolvedValue(
			failure(genericError as any),
		);

		await expect(service.create(dto)).rejects.toThrow('Something went wrong');
	});
});
