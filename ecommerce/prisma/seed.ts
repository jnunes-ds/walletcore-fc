import { faker } from '@faker-js/faker';
import { NestFactory } from '@nestjs/core';
import { SeederModule } from '../src/seeder.module';
import { CreateUserUsecase } from '@modules/user/usecases/create_user/create_user.usecase';
import { RegisterProductUsecase } from '@modules/product/usecases/register_product/register_product.usecase';
import { PurchaseProductUsecase } from '@modules/purchase/usecases/purchase_product/purchase_product.usecase';
import { PrismaService } from '@database/prisma.service';
import { IRegisterProductUsecaseOutputDTO } from '@modules/product/usecases/register_product/register_product.usecase.dto';
import { ICreateUserOtuputDTO } from '@modules/user/usecases/create_user/create_user.usecase.dto';
import { Kafka } from 'kafkajs';

async function ensureKafkaTopics(brokers: string[]) {
	console.log('Seeder: Connecting to Kafka to ensure topics exist...');
	const kafka = new Kafka({
		clientId: 'kafka-seeder-topic-creator',
		brokers,
		retry: {
			initialRetryTime: 3000,
			retries: 10,
		},
	});
	const admin = kafka.admin();
	const topicsToCreate = [
		'user_created',
		'product_registered',
		'product_purchased',
		'account_created',
		'balances', // Garante que o tópico de balanços seja criado.
		'transactions', // Garante que o tópico de transações seja criado.
	];

	try {
		await admin.connect();
		console.log('Seeder: Kafka Admin connected. Ensuring topics...');
		await admin.createTopics({
			waitForLeaders: true,
			topics: topicsToCreate.map((topic) => ({
				topic,
				configEntries: [{ name: 'retention.ms', value: '-1' }], // Keep messages forever
			})),
		});
		console.log(`Seeder: Topics ${topicsToCreate.join(', ')} are ready.`);
	} catch (error) {
		console.error('Seeder: Failed to create Kafka topics:', error);
		process.exit(1);
	} finally {
		await admin.disconnect();
		console.log('Seeder: Kafka Admin disconnected.');
	}
}

async function bootstrap() {
	const brokers = ['kafka:29092'];
	await ensureKafkaTopics(brokers);

	const app = await NestFactory.createApplicationContext(SeederModule);

	console.log('Start seeding...');

	const prismaService = app.get(PrismaService);
	const createUserUsecase = app.get(CreateUserUsecase);
	const registerProductUsecase = app.get(RegisterProductUsecase);
	const purchaseProductUsecase = app.get(PurchaseProductUsecase);

	await prismaService.purchase.deleteMany();
	await prismaService.product.deleteMany();
	await prismaService.user.deleteMany();
	console.log('Old data cleared.');

	// Cria usuários
	const users: ICreateUserOtuputDTO[] = [];
	console.log('--- Creating Users ---');
	for (let i = 0; i < 10; i++) {
		const userInput = {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			isSeller: i < 5,
		};
		const result = await createUserUsecase.execute(userInput);
		if (result.isSuccess) {
			console.log('User created:', result.value);
			users.push(result.value);
		} else {
			console.error('Failed to create user:', result.error);
		}
	}
	console.log(`${users.length} total users created.`);

	const sellers = users.filter((u) => u.isSeller);
	const buyers = users.filter((u) => !u.isSeller);
	console.log(`${sellers.length} sellers found.`);
	console.log(`${buyers.length} buyers found.`);

	// Cria produtos
	const allProducts: IRegisterProductUsecaseOutputDTO[] = [];
	console.log('--- Creating Products ---');
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
				console.error(
					`Failed to create product for seller ${seller.id}:`,
					result.error,
				);
			}
		}
	}
	console.log(`${allProducts.length} total products created.`);

	// Cria compras
	if (allProducts.length > 0 && buyers.length > 0) {
		console.log('--- Creating Purchases ---');
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
					console.error(
						`Failed to create purchase for buyer ${buyer.id}:`,
						result.error,
					);
				}
			}
		}
		console.log(`${purchasesCreatedCount} total purchases created.`);
	}

	console.log('Seeding finished.');
	await app.close();
}

bootstrap().catch((e) => {
	console.error(e);
	process.exit(1);
});
