import { derived, writable } from 'svelte/store';
import type { ICommand, IEvent, IPlayer } from './tic-tac-toe-interface';
import type { IBoard } from './tic-tac-toe-reducer';
import {
	turnReducer,
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

export const turnStore = derived<typeof eventsStore, IPlayer>(eventsStore, (events, set) => {
	set(events.reduce(turnReducer, 'one'));
});
