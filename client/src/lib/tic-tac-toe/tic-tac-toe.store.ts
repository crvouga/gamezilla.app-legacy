import { derived, writable } from 'svelte/store';
import type { ICommand, IEvent } from './tic-tac-toe.interface';
import type { IBoard } from './tic-tac-toe.reducer';
import {
	boardReducer,
	BOARD_DIMENSIONS,
	eventsReducer,
	toInitialBoard
} from './tic-tac-toe.reducer';

const eventsStore = writable<IEvent[]>([]);

export const dispatch = (command: ICommand): void => {
	eventsStore.update((events) => {
		return [command].reduce(eventsReducer, events);
	});
};

export const boardStore = derived<typeof eventsStore, IBoard>(eventsStore, (events, set) => {
	const initialBoard = toInitialBoard(BOARD_DIMENSIONS);

	set(events.reduce(boardReducer, initialBoard));
});
