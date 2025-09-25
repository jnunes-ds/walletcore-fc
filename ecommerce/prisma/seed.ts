import { faker } from '@faker-js/faker';
import { CreateUserUsecase } from '@modules/user/usecases/create_user/create_user.usecase';
import { RegisterProductUsecase } from '@modules/product/usecases/register_product/register_product.usecase';
import { PurchaseProductUsecase } from '@modules/purchase/usecases/purchase_product/purchase_product.usecase';
import { PrismaService } from '@database/prisma.service';
import { ClientKafka } from '@nestjs/microservices';
import { IRegisterProductUsecaseOutputDTO } from '@modules/product/usecases/register_product/register_product.usecase.dto';
import { ICreateUserOtuputDTO } from '@modules/user/usecases/create_user/create_user.usecase.dto';

async function main() {
	console.log('Start seeding...');

	// O construtor de ClientKafka espera apenas as opções, não o objeto de configuração completo.
	const kafkaClient = new ClientKafka({
		client: {
			clientId: 'seeder',
			brokers: ['localhost:9092'], // Endereço do Kafka exposto no docker-compose
		},
		consumer: {
			groupId: 'seeder-group',
		},
	});

	await kafkaClient.connect();

	const prismaService = new PrismaService();
	await prismaService.$connect();

	// Instancia os use cases com o cliente Kafka real
	const createUserUsecase = new CreateUserUsecase(prismaService, kafkaClient);
	const registerProductUsecase = new RegisterProductUsecase(
		prismaService,
		kafkaClient,
	);
	const purchaseProductUsecase = new PurchaseProductUsecase(
		prismaService,
		kafkaClient,
	);

	// Limpa o banco de dados
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
	if (allProducts.length > 0) {
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

	// Fecha as conexões no final
	await kafkaClient.close();
	await prismaService.$disconnect();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
