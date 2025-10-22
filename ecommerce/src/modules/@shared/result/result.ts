import { DomainError } from '../errors/domain_errors';

type Success<T> = {
	isSuccess: true;
	value: T;
};

type Failure<E extends DomainError> = {
	isSuccess: false;
	error: E;
};

/**
 * O tipo Result representa o resultado de uma operação que pode falhar.
 * Ele pode ser um sucesso, contendo um valor, ou uma falha, contendo um erro.
 * @template T O tipo do valor em caso de sucesso.
 * @template E O tipo do erro em caso de falha.
 */
export type Result<T, E extends DomainError> = Success<T> | Failure<E>;

export const success = <T, E extends DomainError>(value: T): Result<T, E> => ({
	isSuccess: true,
	value,
});

export const failure = <T, E extends DomainError>(error: E): Result<T, E> => ({
	isSuccess: false,
	error,
});
