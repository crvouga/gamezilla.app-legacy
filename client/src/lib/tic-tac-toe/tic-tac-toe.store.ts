import { writable } from 'svelte/store';
import type { ICommand, IEvent } from './tic-tac-toe.interface';
import { eventsReducer } from './tic-tac-toe.reducer';

const eventStore = writable<IEvent[]>([]);

export const dispatch = (command: ICommand): void => {
	eventStore.update((events) => {
		return [command].reduce(eventsReducer, events);
	});
};
