export interface ICreateUserInputDTO {
	name: string;
	email: string;
	isSeller: boolean;
}

export interface ICreateUserOtuputDTO {
	id: string;
	name: string;
	balance: number;
	email: string;
	isSeller: boolean;
}
