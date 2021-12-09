const name = 'tic-tac-toe';

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

export type ICommand = ReturnType<IMove>;

export type IEvent = ReturnType<IMoveFailed> | ReturnType<IMoveSucceeded>;
