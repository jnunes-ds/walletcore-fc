import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { IRegisterProductUsecaseInputDTO } from '@modules/product/usecases/register_product/register_product.usecase.dto';
import { RegisterProductUsecase } from '@modules/product/usecases/register_product/register_product.usecase';
import { ListAllProductsUsecase } from '@modules/product/usecases/list_all/list_all.usecase';
import { ConflictError, NotFoundError } from '@shared/errors/domain_errors';

@Injectable()
export class ProductService {
	constructor(
		private readonly registerUsecase: RegisterProductUsecase,
		private readonly listAllUsecase: ListAllProductsUsecase,
	) {}

	async findAll() {
		const result = await this.listAllUsecase.execute();
		// Embora o use case agora lance exceções, manter este padrão no serviço
		// torna a arquitetura consistente e resiliente a futuras alterações.
		if (!result.isSuccess) {
			throw result.error;
		}
		return result.value;
	}

	async register(body: IRegisterProductUsecaseInputDTO) {
		const result = await this.registerUsecase.execute(body);
		if (!result.isSuccess) {
			const error = result.error;
			if (error instanceof ConflictError) {
				throw new ConflictException(error.message);
			}
			if (error instanceof NotFoundError) {
				throw new NotFoundException(error.message);
			}
			throw error;
		}
		return result.value;
	}
}
