import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PurchaseProductUsecase } from '@modules/purchase/usecases/purchase_product/purchase_product.usecase';

@Module({
	controllers: [PurchaseController],
	providers: [PurchaseService, PurchaseProductUsecase],
})
export class PurchaseModule {}
