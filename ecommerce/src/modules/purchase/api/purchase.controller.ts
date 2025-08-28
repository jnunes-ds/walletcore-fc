import { Controller, Post, Body } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Controller('purchase')
export class PurchaseController {
	constructor(private readonly purchaseService: PurchaseService) {}

	@Post()
	create(@Body() createPurchaseDto: CreatePurchaseDto) {
		return this.purchaseService.create(createPurchaseDto);
	}
}
