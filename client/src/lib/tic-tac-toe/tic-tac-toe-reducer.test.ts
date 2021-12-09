import { eventsReducer, move, moveFailed, moveSucceeded } from '.';

describe('tic tac toe', () => {
	test('player one can make the first move', () => {
		const commands = [
			move({
				player: 'one',
				row: 0,
				column: 0
			})
		];

		const expected = [moveSucceeded(commands[0].payload)];

		const actual = commands.reduce(eventsReducer, []);

		expect(actual).toEqual(expected);
	});

	test('players can only move it is their turn', () => {
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
			}),
			move({
				player: 'two',
				row: 1,
				column: 1
			}),
			move({
				player: 'two',
				row: 1,
				column: 2
			})
		];

		const expected = [
			moveSucceeded(commands[0].payload),
			moveFailed({
				commandId: commands[1].id,
				reason: 'NOT_TURN'
			}),
			moveSucceeded(commands[2].payload),
			moveFailed({
				commandId: commands[3].id,
				reason: 'NOT_TURN'
			})
		];

		const actual = commands.reduce(eventsReducer, []);

		expect(actual).toEqual(expected);
	});

	test('players can not make a move on the same position', () => {
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

		const expected = [
			moveSucceeded(commands[0].payload),
			moveFailed({
				commandId: commands[1].id,
				reason: 'POSITION_TAKEN'
			})
		];

		const actual = commands.reduce(eventsReducer, []);

		expect(actual).toEqual(expected);
	});
});
