import {describe, expect, test} from 'bun:test';
import {FlowGridShorthand} from '../../flow-variant/flow-grid';
import * as FlowAlgoSolveAsync from './flow-algo-solve-async';
import {Flow} from '../../../flow';
import {Logger} from 'gamezilla-app/app/@/server/logger';

describe(import.meta.file, () => {
	test('solve flow', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', 'B', 'C'],
			[' ', ' ', ' '],
			['A', 'B', 'C'],
		]);

		const solution = await FlowAlgoSolveAsync.solve(
			flow,
			Logger({
				t: 'noop',
			}),
		);

		const expected = FlowGridShorthand.toGrid([
			['A', 'B', 'C'],
			['a', 'b', 'c'],
			['A', 'B', 'C'],
		]);

		expect(solution).toBeTruthy();
		if (solution) {
			expect(
				Flow.isSame(
					solution,
					expected,
				),
			).toBe(true);
		}
	});
});
