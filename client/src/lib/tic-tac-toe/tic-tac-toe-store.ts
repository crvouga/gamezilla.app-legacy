import { derived, writable } from 'svelte/store';
import type { ICommand, IEvent } from './tic-tac-toe-interface';
import type { IBoard } from './tic-tac-toe-reducer';
import {
	boardReducer,
	BOARD_DIMENSIONS,
	eventsReducer,
	toInitialBoard
} from './tic-tac-toe-reducer';

export const eventsStore = writable<IEvent[]>([]);

export const dispatch = (command: ICommand): void => {
	console.log(command);
	eventsStore.update((events) => {
		const nextEvents = [command].reduce(eventsReducer, events);
		console.log(nextEvents);
		return nextEvents;
	});
};

export const boardStore = derived<typeof eventsStore, IBoard>(eventsStore, (events, set) => {
	const initialBoard = toInitialBoard(BOARD_DIMENSIONS);

	set(events.reduce(boardReducer, initialBoard));
});
