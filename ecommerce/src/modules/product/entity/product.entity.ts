import { randomUUID } from 'node:crypto';

interface IProductProps {
	id?: string;
	name: string;
	description?: string;
	price: number;
	sellerId: string;
}

export default class Product {
	readonly id: string;
	readonly name: string;
	readonly description: string | null;
	readonly price: number;
	readonly sellerId: string;

	constructor(props: IProductProps) {
		this.id = props.id ?? randomUUID();
		this.name = props.name;
		this.description = props.description ?? null;
		this.price = props.price;
		this.sellerId = props.sellerId;
	}
}
