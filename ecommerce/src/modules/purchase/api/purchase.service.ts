import { Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PrismaService } from '@database/prisma.service';
import { PurchaseProductUsecase } from '@modules/purchase/usecases/purchase_product/purchase_product.usecase';

@Injectable()
export class PurchaseService {
	constructor(private readonly databaseService: PrismaService) {}

	async create(createPurchaseDto: CreatePurchaseDto) {
		const usecase = new PurchaseProductUsecase(this.databaseService);

		await usecase.execute(createPurchaseDto);
	}
}
