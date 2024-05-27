import { describe, expect, it, test } from "bun:test";
import { FlowGrid, FlowGridDimensions, FlowGridShorthand } from ".";
import { Flow } from "../../flow";
import { eq } from "gamezilla-app/@/core";

describe(import.meta.file, () => {
	it("should initialize the model", () => {
		const initial = FlowGrid.init({
			dimensions: FlowGridDimensions.init({
				height: 3,
				width: 3,
			}),
		});
		expect(FlowGrid.Model.parse(initial).t).toBe("ok");
	});

	it("should initialize the model quickly", () => {
		const start = process.hrtime();

		FlowGrid.init({
			dimensions: FlowGridDimensions.init({
				height: 20,
				width: 20,
			}),
		});

		const end = process.hrtime(start);

		const actualNanoseconds = end[0] * 1e9 + end[1];

		const expectedMaxNanoseconds = 10 * 1e6;

		expect(actualNanoseconds).toBeLessThan(expectedMaxNanoseconds);
	});

	test("reverse pipes by source id", () => {
		const grid = FlowGrid.init({
			dimensions: FlowGridDimensions.init({
				height: 2,
				width: 1,
			}),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({ x: 0, y: 0 }),
					endId: FlowGrid.toNodeId({ x: 0, y: 1 }),
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
		const expected: FlowGrid.Model["pipesBySourceId"] = {
			[FlowGrid.toNodeId({ x: 0, y: 1 })]: {
				edgeId: Flow.toEdgeId({
					targetId: FlowGrid.toNodeId({ x: 0, y: 0 }),
					sourceId: FlowGrid.toNodeId({ x: 0, y: 1 }),
				}),
				groupId: "A",
			},
		};
		const actual = Flow.toReversedPipesBySourceId(grid);
		expect(eq(actual, expected)).toBe(true);
	});

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
	})

	test("not isSolved with adjacent disconnected A terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " "],
			["A", " "],
		]);
		expect(Flow.isSolved(grid)).toBe(false);
	})

	test.todo("find solutions 2x2 with A terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " "],
			[" ", "A"],
		]);

		const expected = [
			FlowGridShorthand.toGrid([
				["A", " "],
				["a", "A"],
			]),
			FlowGridShorthand.toGrid([
				["A", "a"],
				[" ", "A"],
			]),
		]

		const actual = Flow.findSolutions(grid);

		expect(actual.length).toBe(expected.length);
		expect(actual.some(actual => expected.some(expected => Flow.isSame(actual, expected)))).toBe(true);
	})

	test.todo("find solutions 3x3 with A terminals and B terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", "B", " "],
			[" ", " ", " "],
			["A", "B", " "],
		]);

		const expected = [
			FlowGridShorthand.toGrid([
				["A", "B", " "],
				["a", "b", " "],
				["A", "B", " "],
			])
		]

		const actual = Flow.findSolutions(grid);

		expect(actual.length).toBe(expected.length);
		expect(actual.some(actual => expected.some(expected => Flow.isSame(actual, expected)))).toBe(true);
	})
});
