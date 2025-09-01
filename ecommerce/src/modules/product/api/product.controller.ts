import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { type IRegisterProductUsecaseInputDTO } from '@modules/product/usecases/register_product/register_product.usecase.dto';

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Get()
	findAll() {
		return this.productService.findAll();
	}

	@Post()
	register(@Body() body: IRegisterProductUsecaseInputDTO) {
		return this.productService.register(body);
	}
}
