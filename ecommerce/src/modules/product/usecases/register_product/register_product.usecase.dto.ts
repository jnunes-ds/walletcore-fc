export interface IRegisterProductUsecaseInputDTO {
	name: string;
	description: string;
	price: number;
	sellerId: string;
}

export interface IRegisterProductUsecaseOutputDTO {
	id: string;
	name: string;
	description: string;
	price: number;
	sellerId: string;
}
