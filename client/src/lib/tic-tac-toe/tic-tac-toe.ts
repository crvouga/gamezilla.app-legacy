import { boardClicked, move, moveFailed, moveSucceeded, name } from './tic-tac-toe-interface';
import type { IEvent } from './tic-tac-toe-interface';
import { eventsReducer } from './tic-tac-toe-reducer';

type IState = { [name]: IEvent[] };

const slice = (state: IState): IEvent[] => state[name] ?? [];
const moves = (state: IState): { player: 'one' | 'two'; row: number; column: number }[] =>
	slice(state).reduce<{ player: 'one' | 'two'; row: number; column: number }[]>((moves, event) => {
		if (event.type === 'tic-tac-toe/MOVE_SUCCEEDED') {
			return [...moves, event.payload];
		}
		return moves;
	}, []);

export const ticTacToe = {
	name,
	reducer: eventsReducer,
	actions: {
		move,
		moveFailed,
		moveSucceeded,
		boardClicked
	},
	selectors: {
		slice,
		moves
	}
};
