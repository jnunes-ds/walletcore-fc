import Entity from "../../@shared/entity/entity.abstract";

export default class User extends Entity {
	private _name: string;
	private _email: string;
	private _isSeller: boolean;
	private _products: string[];

	constructor(id: string, name: string, email: string, isSeller: boolean) {
		super();
		this._id = id ?? Math.random().toString();
		this._name = name;
		this._email = email;
		this._isSeller = isSeller;
	}

	get name(): string {
		return this._name;
	}

	get email(): string {
		return this._email;
	}

	get isSeller(): boolean {
		return this._isSeller;
	}

	changeName(name: string) {
		this._name = name;
	}

	changeEmail(email: string) {
		this._email = email;
	}

	changeIsSeller(isSeller: boolean) {
		this._isSeller = isSeller;
	}
	get products() {
		return this._products;
	}

	getProductById(productId: string) {
		if (!this._products.length) throw new Error('User has no products');
		const currentProduct = this._products.map(product => product === productId);
	}
}