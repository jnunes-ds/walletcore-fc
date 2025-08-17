// Crie uma entidade produto
import Entity from "../../@shared/entity/entity.abstract";

export default class Product extends Entity {
	private _name: string;
	private _description: string;
	private _price: number;
	private _userId: string;

	constructor(id: string, name: string, description: string, price: number, userId: string) {
		super();
		this._id = id ?? Math.random().toString();
		this._name = name;
		this._description = description;


		this._price = price;
		this._userId = userId;
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

	get userId(): string {
		return this._userId;
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
