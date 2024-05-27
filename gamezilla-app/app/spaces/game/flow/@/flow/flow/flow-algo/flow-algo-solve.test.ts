import { describe, expect, test } from "bun:test";
import { Flow } from "../../flow";
import { FlowGridShorthand } from "../../flow-variant/flow-grid";
import * as FlowAlgoSolve from "./flow-algo-solve";

describe(import.meta.file, () => {
	test("find solutions 2x2 with A terminals", () => {
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
		];

		const actual = FlowAlgoSolve.solve(grid);

		expect(actual.length).toBe(expected.length);
		expect(
			actual.some((actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("find solutions 3x3 with A terminals and B terminals", () => {
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
			]),
		];

		const actual = FlowAlgoSolve.solve(grid);

		expect(
			actual.some((actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
		expect(actual.length).toBe(expected.length);
	});

	test("find solutions 3x3 with A terminals and B terminals and C terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", "B", "C"],
			[" ", " ", " "],
			["A", "B", "C"],
		]);

		const expected = [
			FlowGridShorthand.toGrid([
				["A", "B", "C"],
				["a", "b", "c"],
				["A", "B", "C"],
			]),
		];

		const actual = FlowAlgoSolve.solve(grid);

		expect(
			actual.some((actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
		expect(actual.length).toBe(expected.length);
	});

	test("find solutions 3x3 with far A terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", " "],
			[" ", " ", " "],
			[" ", " ", "A"],
		]);

		const expected = [
			FlowGridShorthand.toGrid([
				["A", " ", " "],
				["a", " ", " "],
				["a", "a", "A"],
			]),
			FlowGridShorthand.toGrid([
				["A", "a", "a"],
				[" ", " ", "a"],
				[" ", " ", "A"],
			]),
			FlowGridShorthand.toGrid([
				["A", "a", " "],
				[" ", "a", "a"],
				[" ", " ", "A"],
			]),
			FlowGridShorthand.toGrid([
				["A", "a", " "],
				[" ", "a", " "],
				[" ", "a", "A"],
			]),
			FlowGridShorthand.toGrid([
				["A", "a", " "],
				[" ", "a", "a"],
				[" ", " ", "A"],
			]),
			FlowGridShorthand.toGrid([
				["A", " ", " "],
				["a", "a", "a"],
				[" ", " ", "A"],
			]),
			FlowGridShorthand.toGrid([
				["A", " ", " "],
				["a", "a", "a"],
				[" ", " ", "A"],
			]),
			FlowGridShorthand.toGrid([
				["A", " ", " "],
				["a", "a", " "],
				[" ", "a", "A"],
			]),
			FlowGridShorthand.toGrid([
				["A", "a", "a"],
				["a", "a", "a"],
				["a", "a", "A"],
			]),
		];

		const actual = FlowAlgoSolve.solve(grid);

		expect(
			actual.some((actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("find solutions for adjacent terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", "A"],
			[" ", " "],
		]);
		const expected = [
			FlowGridShorthand.toGrid([
				["Aa", "A"],
				[" ", " "],
			]),
		];
		const actual = FlowAlgoSolve.solve(grid);
		expect(
			actual.some((actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("find solutions for 3x3 with far A terminals and B terminals and C terminals", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", "C", "C"],
			[" ", " ", " "],
			["B", "B", "A"],
		]);
		const expected = [
			FlowGridShorthand.toGrid([
				["A", "Cc", "C"],
				["a", "a", "a"],
				["Bb", "B", "A"],
			]),
		];
		const actual = FlowAlgoSolve.solve(grid);
		expect(
			actual.some((actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("find solutions for 5x5 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", "D", " ", "C"],
			[" ", " ", "B", " ", "E"],
			[" ", " ", " ", " ", " "],
			[" ", "D", " ", "C", " "],
			[" ", "A", "B", "E", " "],
		]);

		const expected = [
			FlowGridShorthand.toGrid([
				["A", "d", "D", "c", "C"],
				["a", "d", "B", "c", "E"],
				["a", "d", "b", "c", "e"],
				["a", "D", "b", "C", "e"],
				["a", "A", "B", "E", "e"],
			]),
		];

		const actual = FlowAlgoSolve.solve(grid);

		expect(
			actual.some((actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});
	
    test("find solutions for 6x6 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", "D", " ", "C", "F"],
			[" ", " ", "B", " ", "E", " "],
			[" ", " ", " ", " ", " ", " "],
			[" ", "D", " ", "C", " ", " "],
            [" ", "A", "B", "E", " ", " "],
            ["F", " ", " ", " ", " ", " "],
		]);

		const expected = [
			FlowGridShorthand.toGrid([
				["A", "d", "D", "c", "C", "F"],
				["a", "d", "B", "c", "E", "f"],
				["a", "d", "b", "c", "e", "f"],
				["a", "D", "b", "C", "e", "f"],
                ["a", "A", "B", "E", "e", "f"],
                ["F", "f", "f", "f", "f", "f"],
			]),
		];

		const actual = FlowAlgoSolve.solve(grid);

		expect(
			actual.some((actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
    });
    
    test("find solutions for 7x7 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			[" ", " ", "C", "D", "E", " ", "E"],
			[" ", " ", "F", " ", " ", " ", " "],
			[" ", " ", "G", " ", "H", "I", " "],
			[" ", " ", " ", " ", "D", " ", " "],
			[" ", " ", " ", "C", " ", " ", " "],
			[" ", "F", " ", "G", " ", " ", "H"],
			[" ", " ", " ", " ", " ", " ", "I"],
        ]);
        
		const expected = [
			FlowGridShorthand.toGrid([
				["c", "c", "C", "D", "E", "e", "E"],
				["c", "f", "F", "d", "h", "h", "h"],
				["c", "f", "G", "d", "H", "I", "h"],
				["c", "f", "g", "d", "D", "i", "h"],
				["c", "f", "g", "C", "c", "i", "h"],
				["c", "F", "g", "G", "c", "i", "H"],
				["c", "c", "c", "c", "c", "i", "I"],
			]),
		];
		const actual = FlowAlgoSolve.solve(grid);

		expect(
			actual.some((actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
        });
    
	test("find solutions for 8x8 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", " ", "A", "B", " ", " ", " "],
			[" ", " ", "C", "D", "E", " ", "E", " "],
			[" ", " ", "F", " ", " ", " ", " ", " "],
			[" ", " ", "G", " ", "H", "I", " ", " "],
			[" ", " ", " ", " ", "D", " ", " ", " "],
			[" ", " ", " ", "C", " ", " ", " ", " "],
			[" ", "F", " ", "G", " ", " ", "H", "B"],
			[" ", " ", " ", " ", " ", " ", " ", "I"],
		]);
		const expected = [
			FlowGridShorthand.toGrid([
				["A", "a", "a", "A", "B", "b", "b", "b"],
				["c", "c", "C", "D", "E", "e", "E", "b"],
				["c", "f", "F", "d", "h", "h", "h", "b"],
				["c", "f", "G", "d", "H", "I", "h", "b"],
				["c", "f", "g", "d", "D", "i", "h", "b"],
				["c", "f", "g", "C", "c", "i", "h", "b"],
				["c", "F", "g", "G", "c", "i", "H", "B"],
				["c", "c", "c", "c", "c", "i", "i", "I"],
			]),
		];
		const actual = FlowAlgoSolve.solve(grid);

		expect(
			actual.some((actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});
});
