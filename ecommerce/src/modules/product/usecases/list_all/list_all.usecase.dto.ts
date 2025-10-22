export type ListAllProductsUsecaseInputDTO = undefined;

export type ListAllProductsUsecaseOutputDTO = {
	id: string;
	name: string;
	price: number;
	description: string | null;
	sellerId: string;
}[];
