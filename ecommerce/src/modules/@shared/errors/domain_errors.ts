/**
 * Erro base para todas as exceções de domínio da aplicação.
 * Permite identificar erros de negócio de forma programática.
 */
export class DomainError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class NotFoundError extends DomainError {
	constructor(resource: string) {
		super(`${resource} not found`);
	}
}

export class ConflictError extends DomainError {
	constructor(message: string) {
		super(message);
	}
}