import { put, select, takeEvery } from 'redux-saga/effects';
import type { IEvent, IPlayer } from './tic-tac-toe-interface';
import { boardClicked, move, moveFailed, moveSucceeded, name } from './tic-tac-toe-interface';
import { eventsReducer, turnReducer } from './tic-tac-toe-reducer';

type IState = { [name]: IEvent[] };

const slice = (state: IState): IEvent[] => state[name] ?? [];
const moves = (state: IState): { player: 'one' | 'two'; row: number; column: number }[] =>
	slice(state).reduce<{ player: 'one' | 'two'; row: number; column: number }[]>((moves, event) => {
		if (event.type === 'tic-tac-toe/MOVE_SUCCEEDED') {
			return [...moves, event.payload];
		}
		return moves;
	}, []);

const turn = (state: IState): IPlayer => slice(state).reduce(turnReducer, 'one');

const selectors = {
	turn,
	moves,
	slice
};

const actions = {
	move,
	moveFailed,
	moveSucceeded,
	boardClicked
};
export const ticTacToe = {
	name,
	reducer: eventsReducer,
	actions,
	selectors
};

export function* ticTacToeSaga(): unknown {
	yield takeEvery(actions.boardClicked, function* (action) {
		console.log({ action });
		const turn = yield select(selectors.turn);
		yield put(
			actions.move({
				...action.payload,
				player: turn
			})
		);
	});
}
