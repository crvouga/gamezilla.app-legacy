import type { IMove, IMoveFailed, IMoveSucceeded } from './tic-tac-toe-interface';

export const move: IMove = (payload) => {
	return {
		type: 'tic-tac-toe/MOVE',
		id: String(Math.random()),
		payload
	};
};

export const moveSucceeded: IMoveSucceeded = (payload) => {
	return {
		type: 'tic-tac-toe/MOVE_SUCCEEDED',
		payload
	};
};

export const moveFailed: IMoveFailed = (payload) => {
	return {
		type: 'tic-tac-toe/MOVE_FAILED',
		payload
	};
};
