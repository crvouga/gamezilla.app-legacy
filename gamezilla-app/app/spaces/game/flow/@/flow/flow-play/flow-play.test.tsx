import {describe, expect, it, test} from 'bun:test';
import type {FlowVariant} from '../flow-variant';
import {Flow} from '../flow';
import {FlowGrid} from '../flow-variant/flow-grid';
import {FlowGridShorthand} from '../flow-variant/flow-grid/flow-grid-shorthand';
import {FlowPuzzle} from '../../flow-puzzle/flow-puzzle';
import {FlowPlay} from '.';

const Fixture = async ({ctxFlow}: {ctxFlow: FlowVariant.Model}) => {
	const ctxflowPuzzle = await FlowPuzzle.random({
		flow: ctxFlow,
	});
	const ctx = {flowPuzzle: ctxflowPuzzle};
	const init = FlowPlay.init({ctx});

	const update = (init: FlowPlay.Model, msgs: FlowPlay.Msg[]) => {
		return msgs.reduce<
			ReturnType<
				typeof FlowPlay.update
			>
		>(
			(output, msg) =>
				FlowPlay.update(
					{
						ctx,
						model: output.model,
						msg,
					},
				),
			{
				model: init,
			},
		);
	};

	const solutionMsgs = FlowPlay.toSolutionMsgs({
		flow: ctxFlow,
	});

	return {
		flow: ctxFlow,
		init,
		update,
		solutionMsgs,
	};
};

describe(import.meta.file, () => {
	test('to solution msgs', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', ' ', ' '],
			[' ', 'B', ' '],
			[' ', ' ', 'A'],
		]);

		const f = await Fixture({
			ctxFlow: flow,
		});

		const msgs = FlowPlay.toSolutionMsgs({
			flow,
		});

		const before = FlowPlay.toFlow({
			flow,
			model: f.init,
		});

		const after = FlowPlay.toFlow({
			flow,
			model: f.update(f.init, msgs)
				.model,
		});

		expect(Flow.isSolved(before)).toBe(false);
		expect(Flow.isSolved(after)).toBe(true);
	});

	it('should output connected terminals event', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', ' ', 'B'],
			['a', 'B', ' '],
			['a', ' ', 'A'],
		]);
		const f = await Fixture({
			ctxFlow: flow,
		});

		const output = f.update(f.init, [
			{
				t: 'user-pressed-down-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 0,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 2,
						y: 2,
					},
				),
			},
			{
				t: 'user-pressed-up-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 2,
						y: 2,
					},
				),
			},
		]);

		expect(output.event?.t).toBe(
			'connected-terminals',
		);
	});

	it('should output started dragging event', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', ' ', ' '],
			['a', 'B', ' '],
			['a', ' ', 'A'],
		]);
		const f = await Fixture({
			ctxFlow: flow,
		});

		const output = f.update(f.init, [
			{
				t: 'user-pressed-down-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 0,
						y: 2,
					},
				),
			},
		]);

		expect(output.event?.t).toBe(
			'started-dragging',
		);
	});

	it('should output solved event', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', ' ', ' '],
			['a', 'B', ' '],
			['a', ' ', 'A'],
		]);
		const f = await Fixture({
			ctxFlow: flow,
		});

		const output = f.update(f.init, [
			{
				t: 'user-pressed-down-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 0,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 2,
						y: 2,
					},
				),
			},
			{
				t: 'user-pressed-up-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 2,
						y: 2,
					},
				),
			},
		]);

		expect(output.event?.t).toBe('solved');
	});

	it('should output solved event even after dragging left the board', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', ' ', ' '],
			['a', 'B', ' '],
			['a', ' ', 'A'],
		]);
		const f = await Fixture({
			ctxFlow: flow,
		});

		const output = f.update(f.init, [
			{
				t: 'user-pressed-down-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 0,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 2,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragging-left',
			},
		]);
		expect(output.event?.t).toBe('solved');
	});

	it('should not output solved event after dragging left the board if not connected', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', ' ', ' '],
			['a', 'B', ' '],
			['a', ' ', 'A'],
		]);
		const f = await Fixture({
			ctxFlow: flow,
		});

		const output = f.update(f.init, [
			{
				t: 'user-pressed-down-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 0,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragging-left',
			},
		]);
		expect(output.event).toBeUndefined();
	});

	it('should not output solved if not pressed up on terminal', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', ' ', ' '],
			['a', 'B', ' '],
			['a', ' ', 'A'],
		]);
		const f = await Fixture({
			ctxFlow: flow,
		});

		const output = f.update(f.init, [
			{
				t: 'user-pressed-down-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 0,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 2,
						y: 2,
					},
				),
			},
		]);

		expect(output.event?.t).not.toBe('solved');
	});

	it('should not output solved event if terminals are not connected', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', ' ', ' '],
			['a', 'B', ' '],
			['a', 'a', 'A'],
		]);

		const f = await Fixture({
			ctxFlow: flow,
		});

		const output = f.update(f.init, [
			{
				t: 'user-pressed-down-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 1,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 0,
					},
				),
			},
			{
				t: 'user-pressed-up-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 0,
					},
				),
			},
		]);

		expect(output.event?.t).not.toBe('solved');
	});

	test('hint', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', ' '],
			[' ', 'A'],
		]);
		const f = await Fixture({
			ctxFlow: flow,
		});

		const msgs: FlowPlay.Msg[] = [
			{
				t: 'user-pressed-down-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 1,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 0,
					},
				),
			},
			{
				t: 'user-pressed-up-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 1,
						y: 0,
					},
				),
			},
		];

		const output = f.update(f.init, msgs);

		expect(output.event?.t).not.toBe('solved');
	});

	test('derive flow with hints', async () => {
		const flow = FlowGridShorthand.toGrid([
			['A', ' '],
			[' ', 'A'],
		]);
		const f = await Fixture({
			ctxFlow: flow,
		});

		const model = f.update(f.init, [
			{
				t: 'user-clicked-hint',
			},
		]).model;

		const flowNew = FlowPlay.toFlow({
			flow,
			model,
		});

		expect(Flow.isSolved(flowNew)).toBe(true);
	});

	it('should not output solved event when drawing from incomplete terminal and then leave drawing', async () => {
		const flow = FlowGridShorthand.toGrid([
			['B', ' ', 'A'],
			[' ', ' ', 'a'],
			[' ', ' ', 'A'],
		]);
		const f = await Fixture({
			ctxFlow: flow,
		});

		const msgs: FlowPlay.Msg[] = [
			{
				t: 'user-pressed-down-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 0,
						y: 0,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 0,
						y: 1,
					},
				),
			},
			{
				t: 'user-dragged-over-node',
				nodeId: FlowGrid.toNodeId(
					{
						x: 0,
						y: 2,
					},
				),
			},
			{
				t: 'user-dragging-left',
			},
		];

		const output = f.update(f.init, msgs);

		expect(output.event?.t).not.toBe('solved');
	});

	test('reset pipes', async () => {
		const f = await Fixture({
			ctxFlow: FlowGridShorthand.toGrid(
				[
					[
						'A',
						' ',
						' ',
					],
					[
						'a',
						' ',
						' ',
					],
					[
						'a',
						'a',
						'A',
					],
				],
			),
		});

		const output = f.update(f.init, [
			{
				t: 'user-clicked-reset',
			},
		]);

		const before = FlowPlay.toFlow({
			flow: f.flow,
			model: f.init,
		});
		const after = FlowPlay.toFlow({
			flow: f.flow,
			model: output.model,
		});

		expect(Flow.isPipesEmpty(before)).toBe(false);
		expect(Flow.isPipesEmpty(after)).toBe(true);
	});

	test('reset hints used', async () => {
		const f = await Fixture({
			ctxFlow: FlowGridShorthand.toGrid(
				[
					[
						'A',
						' ',
						' ',
					],
					[
						' ',
						' ',
						' ',
					],
					[
						' ',
						' ',
						'A',
					],
				],
			),
		});
		const before = f.update(f.init, [
			{
				t: 'user-clicked-hint',
			},
		]);
		const after = f.update(before.model, [
			{
				t: 'user-clicked-reset',
			},
		]);
		expect(before.model.usedHints).not.toEqual({});
		expect(after.model.usedHints).toEqual({});
	});

	test('output reset event', async () => {
		const f = await Fixture({
			ctxFlow: FlowGridShorthand.toGrid(
				[
					[
						'A',
						' ',
					],
					[
						' ',
						'A',
					],
				],
			),
		});
		const output = f.update(f.init, [
			{
				t: 'user-clicked-reset',
			},
		]);
		expect(output.event?.t).toBe('resetted');
	});
});
