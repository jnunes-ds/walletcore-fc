import { Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseProductUsecase } from '@modules/purchase/usecases/purchase_product/purchase_product.usecase';

@Injectable()
export class PurchaseService {
	constructor(private readonly usecase: PurchaseProductUsecase) {}

	async create(createPurchaseDto: CreatePurchaseDto) {
		await this.usecase.execute(createPurchaseDto);
	}
}
