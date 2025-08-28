import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from '@database/prisma.service';
import { RegisterProductUsecase } from '@modules/product/usecases/register_product/register_product.usecase';

@Injectable()
export class ProductService {
	constructor(private readonly databaseService: PrismaService) {}
	async create(createProductDto: CreateProductDto) {
		const usecase = new RegisterProductUsecase(this.databaseService);
		return await usecase.execute(createProductDto);
	}
}
