export const name: 'tic-tac-toe' = 'tic-tac-toe';

export type IPlayer = 'one' | 'two';

type IMovePayload = {
	player: IPlayer;
	column: number;
	row: number;
};

export type IMove = (payload: IMovePayload) => {
	id: string;
	type: `${typeof name}/MOVE`;
	payload: IMovePayload;
};

export type IMoveSucceeded = (payload: IMovePayload) => {
	type: `${typeof name}/MOVE_SUCCEEDED`;
	payload: IMovePayload;
};

type IMoveFaileReason = 'POSITION_TAKEN' | 'GAME_NOT_IN_PROGRESS' | 'NOT_TURN';

type IMoveFailPayload = {
	commandId: string;
	reason: IMoveFaileReason;
};

export type IMoveFailed = (payload: IMoveFailPayload) => {
	type: `${typeof name}/MOVE_FAILED`;
	payload: IMoveFailPayload;
};

export type IBoardClicked = (payload: { row: number; column: number }) => {
	type: `${typeof name}/BOARD_CLICKED`;
	payload: {
		row: number;
		column: number;
	};
};

export type ICommand = ReturnType<IMove>;

export type IEvent = ReturnType<IMoveFailed> | ReturnType<IMoveSucceeded>;

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

export const boardClicked: IBoardClicked = (payload) => {
	return {
		type: 'tic-tac-toe/BOARD_CLICKED',
		payload
	};
};
