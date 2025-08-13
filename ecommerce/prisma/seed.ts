import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	console.log('Start seeding...');

	await prisma.purchase.deleteMany();
	await prisma.product.deleteMany();
	await prisma.user.deleteMany();

	console.log('Old data cleared.');

	const hashedPassword = await bcrypt.hash('123456', 10);

	// Cria 10 usuários
	for (let i = 0; i < 10; i++) {
		const user = await prisma.user.create({
			data: {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				password: hashedPassword,
			},
		});

		if (i < 5) {
			await prisma.product.createMany({
				data: Array.from({ length: 3 }, () => ({
					name: faker.commerce.productName(),
					description: faker.commerce.productDescription(),
					price: parseFloat(faker.commerce.price()),
					sellerId: user.id,
				})),
			});
		}

		if (i < 8) {
			const buyer = await prisma.user.findFirst({
				where: { id: { not: user.id } },
			});
			if (buyer) {
				const products = await prisma.product.findMany({
					where: { sellerId: user.id },
					take: 2,
				});

				if (products.length > 0) {
					await prisma.purchase.create({
						data: {
							buyerId: buyer.id,
							sellerId: user.id,
							products: {
								connect: products.map((p) => ({ id: p.id })),
							},
						},
					});
				}
			}
		}
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
