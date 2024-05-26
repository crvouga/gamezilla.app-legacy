import { describe, expect, test } from "bun:test";
import { FlowGrid, FlowGridDimensions } from ".";
import { Flow } from "../../flow";
import { FlowGridShorthand } from "./flow-grid-shorthand";

describe(import.meta.file, () => {
	test("1x1 with A", async () => {
		const shorthand = FlowGridShorthand.init([["A"]]);
		const actual =  FlowGridShorthand.toGrid(shorthand);
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
			["A", null],
			[null, "A"],
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
			["A", null, null],
			[null, null, null],
			[null, null, "A"],
		])
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
			["A", null, "B"],
			[null, "B", null],
			[null, null, "A"],
		])
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
				B:{
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
});
