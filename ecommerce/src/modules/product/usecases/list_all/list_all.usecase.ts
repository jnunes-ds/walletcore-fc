/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import UseCaseInterface from '@shared/usecase/usecase.interface';
import {
	ListAllProductsUsecaseInputDTO,
	ListAllProductsUsecaseOutputDTO,
} from '@modules/product/usecases/list_all/list_all.usecase.dto';
import { PrismaService } from '@database/prisma.service';
import { failure, Result, success } from '@shared/result/result';
import { DomainError } from '@shared/errors/domain_errors';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ListAllProductsUsecase
	implements
		UseCaseInterface<
			ListAllProductsUsecaseInputDTO,
			Result<ListAllProductsUsecaseOutputDTO, DomainError>
		>
{
	private readonly logger = new Logger(ListAllProductsUsecase.name);

	constructor(private readonly databaseService: PrismaService) {}

	async execute(): Promise<
		Result<ListAllProductsUsecaseOutputDTO, DomainError>
	> {
		try {
			const products = await this.databaseService.product.findMany();

			return success(products);
		} catch (error) {
			this.logger.error(
				`Unexpected error while listing products: ${error.message}`,
				error.stack,
			);
			return failure(error);
		}
	}
}
