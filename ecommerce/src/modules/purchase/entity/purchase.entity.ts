import Entity from '../../@shared/entity/entity.abstract';

export default class Purchase extends Entity {
	private _buyerId: string;
	private _sellerId: string;
	private _productId: string;
	private _price: number;
	private _purchaseDate: Date;

	constructor(
		id: string | null,
		buyerId: string,
		sellerId: string,
		productId: string,
		price: number,
		purchaseDate: Date,
	) {
		super();
		this._id = id ?? Math.random().toString();
		this._buyerId = buyerId;
		this._sellerId = sellerId;
		this._productId = productId;
		this._price = price;
		this._purchaseDate = purchaseDate;
	}

	get buyerId(): string {
		return this._buyerId;
	}

	get sellerId(): string {
		return this._sellerId;
	}

	get productId(): string {
		return this._productId;
	}

	get price(): number {
		return this._price;
	}

	get purchaseDate(): Date {
		return this._purchaseDate;
	}
}
