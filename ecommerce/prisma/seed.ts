import { faker } from '@faker-js/faker';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CreateUserUsecase } from '@modules/user/usecases/create_user/create_user.usecase';
import { RegisterProductUsecase } from '@modules/product/usecases/register_product/register_product.usecase';
import { PurchaseProductUsecase } from '@modules/purchase/usecases/purchase_product/purchase_product.usecase';
import { PrismaService } from '@database/prisma.service';
import { IRegisterProductUsecaseOutputDTO } from '@modules/product/usecases/register_product/register_product.usecase.dto';
import { ICreateUserOtuputDTO } from '@modules/user/usecases/create_user/create_user.usecase.dto';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	console.log('Start seeding...');

	const prismaService = app.get(PrismaService);
	const createUserUsecase = app.get(CreateUserUsecase);
	const registerProductUsecase = app.get(RegisterProductUsecase);
	const purchaseProductUsecase = app.get(PurchaseProductUsecase);

	// Limpa o banco de dados para garantir que o seed seja idempotente
	// A ordem é importante para evitar erros de chave estrangeira
	await prismaService.purchase.deleteMany();
	await prismaService.product.deleteMany();
	await prismaService.user.deleteMany();
	console.log('Old data cleared.');

	// Cria usuários
	const users: ICreateUserOtuputDTO[] = [];
	for (let i = 0; i < 10; i++) {
		const userInput = {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			isSeller: i < 5,
		};
		const result = await createUserUsecase.execute(userInput);
		if (result.isSuccess) {
			users.push(result.value);
		} else {
			console.error('Failed to create user:', result.error.message);
		}
	}
	console.log(`${users.length} users created.`);

	const sellers = users.filter((u) => u.isSeller);
	const buyers = users.filter((u) => !u.isSeller);

	// Cria produtos
	const allProducts: IRegisterProductUsecaseOutputDTO[] = [];
	for (const seller of sellers) {
		for (let i = 0; i < 3; i++) {
			const productInput = {
				name: faker.commerce.productName(),
				description: faker.commerce.productDescription(),
				price: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
				sellerId: seller.id,
			};
			const result = await registerProductUsecase.execute(productInput);
			if (result.isSuccess) {
				allProducts.push(result.value);
			} else {
				console.error('Failed to create product:', result.error.message);
			}
		}
	}
	console.log(`${allProducts.length} products created.`);

	// Cria compras
	if (allProducts.length > 0 && buyers.length > 0) {
		let purchasesCreatedCount = 0;
		for (const buyer of buyers) {
			const productToBuy =
				allProducts[Math.floor(Math.random() * allProducts.length)];

			if (productToBuy.sellerId !== buyer.id) {
				const purchaseInput = {
					buyerId: buyer.id,
					sellerId: productToBuy.sellerId,
					productId: productToBuy.id,
				};
				const result = await purchaseProductUsecase.execute(purchaseInput);
				if (result.isSuccess) {
					purchasesCreatedCount++;
				} else {
					console.error('Failed to create purchase:', result.error.message);
				}
			}
		}
		console.log(`${purchasesCreatedCount} purchases created.`);
	}

	console.log('Seeding finished.');
	await app.close();
}

bootstrap().catch((e) => {
	console.error(e);
	process.exit(1);
});
