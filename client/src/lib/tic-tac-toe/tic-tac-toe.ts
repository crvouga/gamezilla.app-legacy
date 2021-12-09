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

type ICommand = ReturnType<IMove>;

type IEvent = ReturnType<MoveFailed> | ReturnType<MoveSucceeded>;

/* 

*/

const nextTurn: { [player in IPlayer]: IPlayer } = {
	one: 'two',
	two: 'one'
};

const turnReducer = (turn: IPlayer, event: IEvent) => {
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

/* 

*/

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
						takenPosition.row === command.payload.column
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
