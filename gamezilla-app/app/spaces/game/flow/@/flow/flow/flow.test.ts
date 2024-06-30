import { describe, expect, test } from "bun:test";
import { Flow } from "../../flow";
import { FlowGrid, FlowGridShorthand } from "../flow-variant/flow-grid";

describe(import.meta.file, () => {
	test("isSolved 3x3 with A terminals and A pipes", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", " "],
			["a", " ", " "],
			["a", "a", "A"],
		]);
		expect(Flow.isSolved(grid)).toBe(true);
	});

	test("isSolved 3x3 with A terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", " "],
			["a", " ", " "],
			["a", " ", "A"],
		]);
		expect(Flow.isSolved(grid)).toBe(false);
	});

	test("not isSolved 3x3 with A terminals and A pipes and B terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", "B", " "],
			["a", " ", "B"],
			["a", "a", "A"],
		]);
		expect(Flow.isSolved(grid)).toBe(false);
	});

	test("not isSolved 3x3 with A terminals and A pipes and B terminals and B pipes", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", "B", "b"],
			["a", " ", "B"],
			["a", "a", "A"],
		]);
		expect(Flow.isSolved(grid)).toBe(true);
	});

	test("isSolved with A terminals and A pipes long", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", "a", "a"],
			["a", "a", "a"],
			["a", "a", "A"],
		]);
		expect(Flow.isSolved(grid)).toBe(true);
	});

	test("isSolved with adjacent connected A terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["Aa", "A"],
			[" ", " "],
		]);
		expect(Flow.isSolved(grid)).toBe(true);
	});

	test("not isSolved with adjacent disconnected A terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " "],
			["A", " "],
		]);
		expect(Flow.isSolved(grid)).toBe(false);
	});

	test("isConnectedWithPipes with connected terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " "],
			["a", "A"],
		]);
		expect(
			Flow.isConnectedWithPipes(
				grid,
				FlowGrid.toNodeId({ x: 0, y: 0 }),
				FlowGrid.toNodeId({ x: 1, y: 1 }),
			),
		).toBe(true);
	});

	test("isConnectedWithPipes should not fail in case of branching", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", "a", "a"],
			["a", "a", "a"],
			["a", "a", "A"],
		]);
		expect(
			Flow.isConnectedWithPipes(
				grid,
				FlowGrid.toNodeId({ x: 0, y: 0 }),
				FlowGrid.toNodeId({ x: 2, y: 2 }),
			),
		).toBe(true);
	});

	test.only("isConnectedWithPipes should not fail in case of cycles", () => {
		const grid = FlowGridShorthand.toGrid([["A", "a", "A"]]);

		const node1 = FlowGrid.toNodeId({ x: 0, y: 0 });
		const node2 = FlowGrid.toNodeId({ x: 1, y: 0 });
		const node3 = FlowGrid.toNodeId({ x: 2, y: 0 });

		const gridWithCycles: Flow.Model = {
			...grid,
			pipesBySourceId: {
				...grid.pipesBySourceId,
				[node3]: {
					edgeId: Flow.toEdgeId({
						sourceId: node3,
						targetId: node2,
					}),
					groupId: "A",
				},
				[node2]: {
					edgeId: Flow.toEdgeId({
						sourceId: node2,
						targetId: node1,
					}),
					groupId: "A",
				},
			},
		};

		const isConnected = Flow.isConnectedWithPipes(gridWithCycles, node1, node3);

		expect(isConnected).toBe(true);
	});
});
