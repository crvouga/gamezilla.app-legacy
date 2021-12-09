import type { ICommand, IEvent, IPlayer } from './tic-tac-toe-interface';
import { moveFailed, moveSucceeded } from './tic-tac-toe-utility';

const nextTurn: { [player in IPlayer]: IPlayer } = {
	one: 'two',
	two: 'one'
};

export const turnReducer = (turn: IPlayer, event: IEvent): IPlayer => {
	if (event.type === 'tic-tac-toe/MOVE_SUCCEEDED') {
		return nextTurn[event.payload.player];
	}

	return turn;
};

type IPosition = { row: number; column: number };

const takenPositionsReducer = (state: IPosition[], event: IEvent): IPosition[] => {
	if (event.type === 'tic-tac-toe/MOVE_SUCCEEDED') {
		return [
			...state,
			{
				column: event.payload.column,
				row: event.payload.row
			}
		];
	}

	return state;
};

type IStatus =
	| {
			type: 'in-progress';
	  }
	| {
			type: 'tie';
	  }
	| {
			type: 'win';
			winner: IPlayer;
	  };

const statusReducer = (state: IStatus, event: IEvent): IStatus => {
	if (event.type === 'tic-tac-toe/MOVE_SUCCEEDED') {
		return state;
	}

	return state;
};

export type IBoard = (IPlayer | null)[][];

export const toInitialBoard = ({
	rowCount,
	columnCount
}: {
	rowCount: number;
	columnCount: number;
}): IBoard => {
	const board: IBoard = [];
	for (let column = 0; column < columnCount; column++) {
		board.push([]);
		for (let row = 0; row < rowCount; row++) {
			board[column].push(null);
		}
	}
	return board;
};

export const BOARD_DIMENSIONS = {
	rowCount: 3,
	columnCount: 3
};

export const boardReducer = (state: IBoard, event: IEvent): IBoard => {
	if (event.type === 'tic-tac-toe/MOVE_SUCCEEDED') {
		const copy = [...state.map((column) => [...column])];

		copy[event.payload.column][event.payload.row] = event.payload.player;

		return copy;
	}

	return state;
};

export const eventsReducer = (state: IEvent[], command: ICommand): IEvent[] => {
	switch (command.type) {
		case 'tic-tac-toe/MOVE': {
			const status = state.reduce(statusReducer, { type: 'in-progress' });

			if (status.type !== 'in-progress') {
				return [
					...state,
					moveFailed({
						commandId: command.id,
						reason: 'GAME_NOT_IN_PROGRESS'
					})
				];
			}

			if (state.reduce(turnReducer, 'one') !== command.payload.player) {
				return [
					...state,
					moveFailed({
						commandId: command.id,
						reason: 'NOT_TURN'
					})
				];
			}

			const isPositionTaken = state
				.reduce(takenPositionsReducer, [])
				.some(
					(takenPosition) =>
						takenPosition.column === command.payload.column &&
						takenPosition.row === command.payload.row
				);

			if (isPositionTaken) {
				return [
					...state,
					moveFailed({
						commandId: command.id,
						reason: 'POSITION_TAKEN'
					})
				];
			}

			return [...state, moveSucceeded(command.payload)];
		}

		default: {
			return state;
		}
	}
};
