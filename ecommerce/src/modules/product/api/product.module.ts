import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { RegisterProductUsecase } from '@modules/product/usecases/register_product/register_product.usecase';
import { ListAllProductsUsecase } from '@modules/product/usecases/list_all/list_all.usecase';

@Module({
	imports: [], // Removido o ClientsModule, pois agora é global
	controllers: [ProductController],
	providers: [ListAllProductsUsecase, RegisterProductUsecase, ProductService],
})
export class ProductModule {}
