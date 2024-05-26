import { describe, expect, it, test } from "bun:test";
import { FlowGrid, FlowGridDimensions } from ".";
import { Flow } from "../../flow";
import { FlowGridShorthand } from "./flow-grid-shorthand";

describe(import.meta.file, () => {
	test("1x1 with A", async () => {
		const shorthand = FlowGridShorthand.init([["A"]]);
		const actual = FlowGridShorthand.toGrid(shorthand);
		const expected = FlowGrid.init({
			dimensions: FlowGridShorthand.toDimensions(shorthand),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({
						x: 0,
						y: 0,
					}),
					endId: null,
					groupId: "A",
				},
			},
		});
		expect(Flow.isSame(actual, expected)).toBe(true);
	});

	test("2x2 with A", async () => {
		const shorthand = FlowGridShorthand.init([
			["A", " "],
			[" ", "A"],
		]);

		const actual = FlowGridShorthand.toGrid(shorthand);

		const expected = FlowGrid.init({
			dimensions: FlowGridDimensions.init({
				height: 2,
				width: 2,
			}),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({
						x: 0,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 1,
						y: 1,
					}),
					groupId: "A",
				},
			},
		});
		expect(Flow.isSame(actual, expected)).toBe(true);
	});

	test("2x2 with A and B", async () => {
		const shorthand = FlowGridShorthand.init([
			["A", "B"],
			["B", "A"],
		]);

		const actual = FlowGridShorthand.toGrid(shorthand);

		const expected = FlowGrid.init({
			dimensions: FlowGridDimensions.init({
				height: 2,
				width: 2,
			}),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({
						x: 0,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 1,
						y: 1,
					}),
					groupId: "A",
				},
				B: {
					startId: FlowGrid.toNodeId({
						x: 1,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 0,
						y: 1,
					}),
					groupId: "B",
				},
			},
		});
		expect(Flow.isSame(actual, expected)).toBe(true);
	});

	test("3x3 with A", async () => {
		const shorthand = FlowGridShorthand.init([
			["A", " ", " "],
			[" ", " ", " "],
			[" ", " ", "A"],
		]);
		const actual = FlowGridShorthand.toGrid(shorthand);
		const expected = FlowGrid.init({
			dimensions: FlowGridShorthand.toDimensions(shorthand),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({
						x: 0,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 2,
						y: 2,
					}),
					groupId: "A",
				},
			},
		});
		expect(Flow.isSame(actual, expected)).toBe(true);
	});

	test("3x3 with A and B", async () => {
		const shorthand = FlowGridShorthand.init([
			["A", " ", "B"],
			[" ", "B", " "],
			[" ", " ", "A"],
		]);
		const actual = FlowGridShorthand.toGrid(shorthand);
		const expected = FlowGrid.init({
			dimensions: FlowGridShorthand.toDimensions(shorthand),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({
						x: 0,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 2,
						y: 2,
					}),
					groupId: "A",
				},
				B: {
					startId: FlowGrid.toNodeId({
						x: 2,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 1,
						y: 1,
					}),
					groupId: "B",
				},
			},
		});
		expect(Flow.isSame(actual, expected)).toBe(true);
	});

	test("2x2 with terminal and pipe", async () => {
		const shorthand = FlowGridShorthand.init([
			["A", " "],
			["a", "A"],
		]);

		const actual = FlowGridShorthand.toGrid(shorthand);

		const expected = FlowGrid.init({
			dimensions: FlowGridShorthand.toDimensions(shorthand),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({
						x: 0,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 1,
						y: 1,
					}),
					groupId: "A",
				},
			},
			pipesBySourceId: {
				[FlowGrid.toNodeId({ x: 0, y: 0 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 0, y: 0 }),
						targetId: FlowGrid.toNodeId({ x: 0, y: 1 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 0, y: 1 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 0, y: 1 }),
						targetId: FlowGrid.toNodeId({ x: 1, y: 1 }),
					}),
					groupId: "A",
				},
			},
		});

		expect(Flow.isSame(actual, expected)).toBe(true);
	});

	test("2x2 with terminal with pipe", async () => {
		const shorthand = FlowGridShorthand.init([
			["Aa", " "],
			["A", " "],
		]);

		const actual = FlowGridShorthand.toGrid(shorthand);

		const expected = FlowGrid.init({
			dimensions: FlowGridShorthand.toDimensions(shorthand),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({
						x: 0,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 0,
						y: 1,
					}),
					groupId: "A",
				},
			},
			pipesBySourceId: {
				[FlowGrid.toNodeId({ x: 0, y: 0 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 0, y: 0 }),
						targetId: FlowGrid.toNodeId({ x: 0, y: 1 }),
					}),
					groupId: "A",
				},
			},
		});

		expect(Flow.isSame(actual, expected)).toBe(true);
	});

	test("2x2 with A terminal with pipe and B terminal with pipe", async () => {
		const shorthand = FlowGridShorthand.init([
			["Aa", "B"],
			["A", "Bb"],
		]);

		const actual = FlowGridShorthand.toGrid(shorthand);

		const expected = FlowGrid.init({
			dimensions: FlowGridShorthand.toDimensions(shorthand),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({
						x: 0,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 0,
						y: 1,
					}),
					groupId: "A",
				},
				B: {
					startId: FlowGrid.toNodeId({
						x: 1,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 1,
						y: 1,
					}),
					groupId: "B",
				},
			},
			pipesBySourceId: {
				[FlowGrid.toNodeId({ x: 0, y: 0 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 0, y: 0 }),
						targetId: FlowGrid.toNodeId({ x: 0, y: 1 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 1, y: 0 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 1, y: 0 }),
						targetId: FlowGrid.toNodeId({ x: 1, y: 1 }),
					}),
					groupId: "B",
				},
			},
		});

		const isSame = Flow.isSame(actual, expected);

		expect(isSame).toBe(true);
	});

	test("3x3 with A terminal and pipes and B terminal and pipes", async () => {
		const shorthand = FlowGridShorthand.init([
			["A", "B", " "],
			["a", "b", " "],
			["A", "B", " "],
		]);

		const actual = FlowGridShorthand.toGrid(shorthand);

		const expected = FlowGrid.init({
			dimensions: FlowGridShorthand.toDimensions(shorthand),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({
						x: 0,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 0,
						y: 2,
					}),
					groupId: "A",
				},
				B: {
					startId: FlowGrid.toNodeId({
						x: 1,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 1,
						y: 2,
					}),
					groupId: "B",
				},
			},
			pipesBySourceId: {
				[FlowGrid.toNodeId({ x: 0, y: 0 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 0, y: 0 }),
						targetId: FlowGrid.toNodeId({ x: 0, y: 1 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 0, y: 1 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 0, y: 1 }),
						targetId: FlowGrid.toNodeId({ x: 0, y: 2 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 1, y: 0 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 1, y: 0 }),
						targetId: FlowGrid.toNodeId({ x: 1, y: 1 }),
					}),
					groupId: "B",
				},
				[FlowGrid.toNodeId({ x: 1, y: 1 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 1, y: 1 }),
						targetId: FlowGrid.toNodeId({ x: 1, y: 2 }),
					}),
					groupId: "B",
				},
			}
		})
		
		const isSame = Flow.isSame(actual, expected);

		expect(isSame).toBe(true);
	})

	it('should be able to find longest path', async () => {
		const shorthand = FlowGridShorthand.init([
			["A", "a", "a"],
			["a", "a", "a"],
			["a", "a", "A"],
		]);

		const actual = FlowGridShorthand.toGrids(shorthand);

		const expected = FlowGrid.init({
			dimensions: FlowGridShorthand.toDimensions(shorthand),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({
						x: 0,
						y: 0,
					}),
					endId: FlowGrid.toNodeId({
						x: 2,
						y: 2,
					}),
					groupId: "A",
				},
			},
			pipesBySourceId: {
				[FlowGrid.toNodeId({ x: 0, y: 0 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 0, y: 0 }),
						targetId: FlowGrid.toNodeId({ x: 0, y: 1 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 0, y: 1 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 0, y: 1 }),
						targetId: FlowGrid.toNodeId({ x: 0, y: 2 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 0, y: 2 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 0, y: 2 }),
						targetId: FlowGrid.toNodeId({ x: 1, y: 2 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 1, y: 2 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 1, y: 2 }),
						targetId: FlowGrid.toNodeId({ x: 1, y: 1 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 1, y: 1 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 1, y: 1 }),
						targetId: FlowGrid.toNodeId({ x: 1, y: 0 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 1, y: 0 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 1, y: 0 }),
						targetId: FlowGrid.toNodeId({ x: 2, y: 0 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 2, y: 0 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 2, y: 0 }),
						targetId: FlowGrid.toNodeId({ x: 2, y: 1 }),
					}),
					groupId: "A",
				},
				[FlowGrid.toNodeId({ x: 2, y: 1 })]: {
					edgeId: Flow.toEdgeId({
						sourceId: FlowGrid.toNodeId({ x: 2, y: 1 }),
						targetId: FlowGrid.toNodeId({ x: 2, y: 2 }),
					}),
					groupId: "A",
				},
			},
		});

		expect(actual.some(actual => Flow.isSame(actual, expected))).toBe(true)
	})
});
