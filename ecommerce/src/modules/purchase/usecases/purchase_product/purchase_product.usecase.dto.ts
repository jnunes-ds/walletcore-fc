export interface PurchaseProductUsecaseInputDTO {
	productId: string;
	buyerId: string;
	sellerId: string;
}

export interface PurchaseProductUsecaseOutputDTO {
	id: string;
	buyerId: string;
	sellerId: string;
	products: string[];
}
