const name = 'tic-tac-toe';

export type IPlayer = 'one' | 'two';

type MovePayload = {
	player: IPlayer;
	column: number;
	row: number;
};

type IMove = (payload: MovePayload) => {
	id: string;
	type: `${typeof name}/MOVE`;
	payload: MovePayload;
};

export const move: IMove = (payload) => {
	return {
		type: 'tic-tac-toe/MOVE',
		id: String(Math.random()),
		payload
	};
};

type MoveSucceeded = (payload: MovePayload) => {
	type: `${typeof name}/MOVE_SUCCEEDED`;
	payload: MovePayload;
};

export const moveSucceeded: MoveSucceeded = (payload) => {
	return {
		type: 'tic-tac-toe/MOVE_SUCCEEDED',
		payload
	};
};

type IMoveFaileReason = 'POSITION_TAKEN' | 'GAME_NOT_IN_PROGRESS' | 'NOT_TURN';

type IMoveFailPayload = {
	commandId: string;
	reason: IMoveFaileReason;
};

type MoveFailed = (payload: IMoveFailPayload) => {
	type: `${typeof name}/MOVE_FAILED`;
	payload: IMoveFailPayload;
};

export const moveFailed: MoveFailed = (payload) => {
	return {
		type: 'tic-tac-toe/MOVE_FAILED',
		payload
	};
};

export type ICommand = ReturnType<IMove>;

export type IEvent = ReturnType<MoveFailed> | ReturnType<MoveSucceeded>;
