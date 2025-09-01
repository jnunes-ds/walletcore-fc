/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserController', () => {
	let controller: UserController;
	let userService: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: {
						create: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<UserController>(UserController);
		userService = module.get<UserService>(UserService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should call userService.create with the correct dto', async () => {
		const dto: CreateUserDto = { name: 'Test', email: 'test@test.com' };
		const expectedResult = { id: '1', ...dto, isSeller: false };
		(userService.create as jest.Mock).mockResolvedValue(expectedResult);

		const result = await controller.create(dto);

		expect(userService.create).toHaveBeenCalledWith(dto);
		expect(result).toEqual(expectedResult);
	});
});
