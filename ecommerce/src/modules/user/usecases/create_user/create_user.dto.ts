export interface ICreateUserInputDTO {
	name: string;
	email: string;
}

export interface ICreateUserOtuputDTO {
	id: string;
	name: string;
	email: string;
	isSeller: boolean;
}
