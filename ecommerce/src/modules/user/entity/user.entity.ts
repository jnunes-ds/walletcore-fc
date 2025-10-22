import Entity from '@shared/entity/entity.abstract';
import { v4 as uuidv4 } from 'uuid';

export default class User extends Entity {
	private _name: string;
	private _email: string;
	private _balance: number;
	private _isSeller: boolean;
	private _products: string[];

	constructor(name: string, email: string, isSeller: boolean = false) {
		super();
		this._id = uuidv4();
		this._name = name;
		this._email = email;
		this._balance = 0;
		this._isSeller = isSeller;
		this._products = [];
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

	get balance(): number {
		return this._balance;
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

	deposit(amount: number) {
		if (amount <= 0) throw new Error('Invalid amount');
		this._balance += amount;
	}

	withdraw(amount: number) {
		if (this._balance < amount) {
			throw new Error('Insufficient funds');
		}
		this._balance -= amount;
	}

	get products() {
		return this._products;
	}

	getProductById(productId: string) {
		if (!this._products.length) throw new Error('User has no products');
		const currentProduct = this._products.map(
			(product) => product === productId,
		);
		if (!currentProduct) throw new Error('User has no products');
		return currentProduct;
	}
}
