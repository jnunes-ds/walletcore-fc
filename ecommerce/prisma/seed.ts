import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
	console.log('Start seeding...');

	// Limpa o banco de dados na ordem inversa das dependências para evitar erros de chave estrangeira
	await prisma.purchase.deleteMany();
	await prisma.product.deleteMany();
	await prisma.user.deleteMany();

	console.log('Old data cleared.');

	// Cria 10 usuários
	const users = await Promise.all(
		Array.from({ length: 10 }).map((_, i) =>
			prisma.user.create({
				data: {
					id: faker.string.uuid(), // ERRO CORRIGIDO: Fornece um ID, pois não é autoincrementado
					name: faker.person.fullName(),
					email: faker.internet.email(),
					isSeller: i < 5, // Define os 5 primeiros como vendedores
					// ERRO CORRIGIDO: O campo 'password' foi removido, pois não existe no schema.prisma
				},
			}),
		),
	);
	console.log(`${users.length} users created.`);

	const sellers = users.filter((u) => u.isSeller);
	const buyers = users.filter((u) => !u.isSeller);

	// Cria produtos para cada vendedor
	const productPromises = sellers.flatMap((seller) =>
		Array.from({ length: 3 }).map(() =>
			prisma.product.create({
				data: {
					id: faker.string.uuid(), // ERRO CORRIGIDO: Fornece um ID para o produto
					name: faker.commerce.productName(),
					description: faker.commerce.productDescription(),
					price: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
					seller: {
						connect: { id: seller.id },
					},
				},
			}),
		),
	);
	const allProducts = await Promise.all(productPromises);
	console.log(`${allProducts.length} products created.`);

	// Cria compras
	// Cada comprador compra um produto aleatório
	if (allProducts.length > 0) {
		const purchasePromises = buyers.map((buyer) => {
			const productToBuy =
				allProducts[Math.floor(Math.random() * allProducts.length)];

			return prisma.purchase.create({
				data: {
					id: faker.string.uuid(), // ERRO CORRIGIDO: Fornece um ID para a compra
					price: productToBuy.price, // Grava o preço no momento da compra
					buyer: {
						connect: { id: buyer.id },
					},
					seller: {
						connect: { id: productToBuy.sellerId },
					},
					// ERRO CORRIGIDO: A relação é com um único 'product', não 'products'
					product: {
						connect: { id: productToBuy.id },
					},
				},
			});
		});
		await Promise.all(purchasePromises);
		console.log(`${buyers.length} purchases created.`);
	}

	console.log('Seeding finished.');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	.finally(async () => {
		await prisma.$disconnect();
	});
