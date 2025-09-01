import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class ProductService {
	constructor(private readonly prisma: PrismaService) {}

	findAll() {
		return this.prisma.product.findMany();
	}
}
