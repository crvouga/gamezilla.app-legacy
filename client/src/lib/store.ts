import { combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { readable } from 'svelte/store';
import { ticTacToe } from './tic-tac-toe/tic-tac-toe';

const rootReducer = combineReducers({
	[ticTacToe.name]: ticTacToe.reducer
});

const reduxStore = createStore(rootReducer, { 'tic-tac-toe': [] }, composeWithDevTools());

export const store = readable(reduxStore.getState(), (set) => {
	reduxStore.subscribe(() => {
		set(reduxStore.getState());
	});
});

export const dispatch = reduxStore.dispatch;
