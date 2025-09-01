import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { IRegisterProductUsecaseInputDTO } from '@modules/product/usecases/register_product/register_product.usecase.dto';
import { RegisterProductUsecase } from '@modules/product/usecases/register_product/register_product.usecase';

@Injectable()
export class ProductService {
	constructor(
		private readonly usecase: RegisterProductUsecase,
		private readonly databaseService: PrismaService,
	) {}

	findAll() {
		return this.databaseService.product.findMany();
	}

	async register(body: IRegisterProductUsecaseInputDTO) {
		return await this.usecase.execute(body);
	}
}
