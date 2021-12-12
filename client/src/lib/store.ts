import { combineReducers, applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { readable } from 'svelte/store';
import { ticTacToe, ticTacToeSaga } from './tic-tac-toe/tic-tac-toe';
import createSagaMiddleware from 'redux-saga';
import { spawn } from 'redux-saga/effects';
const rootReducer = combineReducers({
	[ticTacToe.name]: ticTacToe.reducer
});

const sagaMiddleware = createSagaMiddleware();

const reduxStore = createStore(
	rootReducer,
	{ 'tic-tac-toe': [] },
	composeWithDevTools(applyMiddleware(sagaMiddleware))
);

function* rootSaga() {
	yield spawn(ticTacToeSaga);
}

sagaMiddleware.run(rootSaga);

export const store = readable(reduxStore.getState(), (set) => {
	reduxStore.subscribe(() => {
		set(reduxStore.getState());
	});
});

export const dispatch = reduxStore.dispatch;
