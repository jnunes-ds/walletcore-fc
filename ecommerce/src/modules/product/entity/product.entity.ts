import Entity from '@shared/entity/entity.abstract';
import { v4 as uuidv4 } from 'uuid';

export default class Product extends Entity {
	private _name: string;
	private _description: string;
	private _price: number;
	private _sellerId: string;

	constructor(
		name: string,
		description: string,
		price: number,
		userId: string,
	) {
		super();
		this._id = uuidv4();
		this._name = name;
		this._description = description;

		this._price = price;
		this._sellerId = userId;
	}

	get name(): string {
		return this._name;
	}

	get description(): string {
		return this._description;
	}

	get price(): number {
		return this._price;
	}

	get sellerId(): string {
		return this._sellerId;
	}

	changeName(name: string) {
		this._name = name;
	}

	changeDescription(description: string) {
		this._description = description;
	}

	changePrice(price: number) {
		this._price = price;
	}
}
