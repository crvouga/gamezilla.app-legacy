import { eventsReducer, move, moveFailed } from './tic-tac-toe';

const last = <T>(xs: T[]) => xs[xs.length - 1];

describe('tic tac toe', () => {
	test('only player one can make the first move');

	test('single move per turn rule', () => {
		const commands = [
			move({
				player: 'one',
				row: 0,
				column: 0
			}),
			move({
				player: 'one',
				row: 1,
				column: 0
			})
		];

		const events = commands.reduce(eventsReducer, []);

		expect(last(events)).toEqual(
			moveFailed({
				commandId: commands[1].id,
				reason: 'NOT_TURN'
			})
		);
	});

	test('single player per position rule', () => {
		const commands = [
			move({
				player: 'one',
				row: 0,
				column: 0
			}),
			move({
				player: 'two',
				row: 0,
				column: 0
			})
		];

		const events = commands.reduce(eventsReducer, []);

		expect(last(events)).toEqual(
			moveFailed({
				commandId: commands[1].id,
				reason: 'POSITION_TAKEN'
			})
		);
	});
});
