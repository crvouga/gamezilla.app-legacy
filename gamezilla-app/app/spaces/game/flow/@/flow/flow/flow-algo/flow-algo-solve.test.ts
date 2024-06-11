import { describe, expect, test } from "bun:test";
import { Flow } from "../../flow";
import { FlowGrid } from "../../flow-variant/flow-grid";
import { FlowGridShorthand } from "../../flow-variant/flow-grid/flow-grid-shorthand";
import * as FlowAlgoSolve from "./flow-algo-solve";

const some = <T>(iterable: Iterable<T>, predicate: (value: T) => boolean) => {
	for (const value of iterable) {
		if (predicate(value)) {
			return true;
		}
	}
	return false;
};

describe(import.meta.file, () => {
	test("2x2 with A terminals", () => {
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

		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("3x3 with A terminals and B terminals", () => {
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
			FlowGridShorthand.toGrid([
				["A", "B", "b"],
				["a", "b", "b"],
				["A", "B", " "],
			]),
			FlowGridShorthand.toGrid([
				["A", "B", "b"],
				["a", " ", "b"],
				["A", "B", "b"],
			]),
		];

		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("3x3 with A terminals and B terminals and C terminals", () => {
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

		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("3x3 with far A terminals", () => {
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

		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("adjacent terminals", () => {
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
		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);
		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("3x3 with far A terminals and B terminals and C terminals", () => {
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
		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);
		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("5x5 puzzle", () => {
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

		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("6x6 puzzle", () => {
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

		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("7x7 puzzle", () => {
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
		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("8x8 puzzle", () => {
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
		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("9x9 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", " ", "A", "B", " ", " ", " ", "J"],
			[" ", " ", "C", "D", "E", " ", "E", " ", " "],
			[" ", " ", "F", " ", " ", " ", " ", " ", " "],
			[" ", " ", "G", " ", "H", "I", " ", " ", " "],
			[" ", " ", " ", " ", "D", " ", " ", " ", " "],
			[" ", " ", " ", "C", " ", " ", " ", " ", " "],
			[" ", "F", " ", "G", " ", " ", "H", "B", " "],
			[" ", " ", " ", " ", " ", " ", " ", "I", " "],
			["J", " ", " ", " ", " ", " ", " ", " ", " "],
		]);
		const expected = [
			FlowGridShorthand.toGrid([
				["A", "a", "a", "A", "B", "b", "b", "b", "J"],
				["c", "c", "C", "D", "E", "e", "E", "b", "j"],
				["c", "f", "F", "d", "h", "h", "h", "b", "j"],
				["c", "f", "G", "d", "H", "I", "h", "b", "j"],
				["c", "f", "g", "d", "D", "i", "h", "b", "j"],
				["c", "f", "g", "C", "c", "i", "h", "b", "j"],
				["c", "F", "g", "G", "c", "i", "H", "B", "j"],
				["c", "c", "c", "c", "c", "i", "i", "I", "j"],
				["J", "j", "j", "j", "j", "j", "j", "j", "j"],
			]),
		];
		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("10x10 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", " ", "A", "B", " ", " ", " ", "J", "K"],
			[" ", " ", "C", "D", "E", " ", "E", " ", " ", " "],
			[" ", " ", "F", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", "G", " ", "H", "I", " ", " ", " ", " "],
			[" ", " ", " ", " ", "D", " ", " ", " ", " ", " "],
			[" ", " ", " ", "C", " ", " ", " ", " ", " ", " "],
			[" ", "F", " ", "G", " ", " ", "H", "B", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", "I", " ", " "],
			["J", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["K", " ", " ", " ", " ", " ", " ", " ", " ", " "],
		]);
		const expected = [
			FlowGridShorthand.toGrid([
				["A", "a", "a", "A", "B", "b", "b", "b", "J", "K"],
				["c", "c", "C", "D", "E", "e", "E", "b", "j", "k"],
				["c", "f", "F", "d", "h", "h", "h", "b", "j", "k"],
				["c", "f", "G", "d", "H", "I", "h", "b", "j", "k"],
				["c", "f", "g", "d", "D", "i", "h", "b", "j", "k"],
				["c", "f", "g", "C", "c", "i", "h", "b", "j", "k"],
				["c", "F", "g", "G", "c", "i", "H", "B", "j", "k"],
				["c", "c", "c", "c", "c", "i", "i", "I", "j", "k"],
				["J", "j", "j", "j", "j", "j", "j", "j", "j", "k"],
				["K", "k", "k", "k", "k", "k", "k", "k", "k", "k"],
			]),
		];

		const config = { distance: FlowGrid.distance(grid) };
		expect(
			some(FlowAlgoSolve.solve(config, grid), (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("11x11 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", " ", "A", "B", " ", " ", " ", "J", "K", "L"],
			[" ", " ", "C", "D", "E", " ", "E", " ", " ", " ", " "],
			[" ", " ", "F", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", "G", " ", "H", "I", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", "D", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", "C", " ", " ", " ", " ", " ", " ", " "],
			[" ", "F", " ", "G", " ", " ", "H", "B", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", "I", " ", " ", " "],
			["J", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["K", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["L", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
		]);
		const expected = [
			FlowGridShorthand.toGrid([
				["A", "a", "a", "A", "B", "b", "b", "b", "J", "K", "L"],
				["c", "c", "C", "D", "E", "e", "E", "b", "j", "k", "l"],
				["c", "f", "F", "d", "h", "h", "h", "b", "j", "k", "l"],
				["c", "f", "G", "d", "H", "I", "h", "b", "j", "k", "l"],
				["c", "f", "g", "d", "D", "i", "h", "b", "j", "k", "l"],
				["c", "f", "g", "C", "c", "i", "h", "b", "j", "k", "l"],
				["c", "F", "g", "G", "c", "i", "H", "B", "j", "k", "l"],
				["c", "c", "c", "c", "c", "i", "i", "I", "j", "k", "l"],
				["J", "j", "j", "j", "j", "j", "j", "j", "j", "k", "l"],
				["K", "k", "k", "k", "k", "k", "k", "k", "k", "k", "l"],
				["L", "l", "l", "l", "l", "l", "l", "l", "l", "l", "l"],
			]),
		];

		const config = { distance: FlowGrid.distance(grid) };

		expect(
			some(FlowAlgoSolve.solve(config, grid), (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("12x12 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", " ", "A", "B", " ", " ", " ", "J", "K", "L", "M"],
			[" ", " ", "C", "D", "E", " ", "E", " ", " ", " ", " ", " "],
			[" ", " ", "F", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", "G", " ", "H", "I", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", "D", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", "C", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", "F", " ", "G", " ", " ", "H", "B", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", "I", " ", " ", " ", " "],
			["J", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["K", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["L", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["M", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
		]);
		const expected = [
			FlowGridShorthand.toGrid([
				["A", "a", "a", "A", "B", "b", "b", "b", "J", "K", "L", "M"],
				["c", "c", "C", "D", "E", "e", "E", "b", "j", "k", "l", "m"],
				["c", "f", "F", "d", "h", "h", "h", "b", "j", "k", "l", "m"],
				["c", "f", "G", "d", "H", "I", "h", "b", "j", "k", "l", "m"],
				["c", "f", "g", "d", "D", "i", "h", "b", "j", "k", "l", "m"],
				["c", "f", "g", "C", "c", "i", "h", "b", "j", "k", "l", "m"],
				["c", "F", "g", "G", "c", "i", "H", "B", "j", "k", "l", "m"],
				["c", "c", "c", "c", "c", "i", "i", "I", "j", "k", "l", "m"],
				["J", "j", "j", "j", "j", "j", "j", "j", "j", "k", "l", "m"],
				["K", "k", "k", "k", "k", "k", "k", "k", "k", "k", "l", "m"],
				["L", "l", "l", "l", "l", "l", "l", "l", "l", "l", "l", "m"],
				["M", "m", "m", "m", "m", "m", "m", "m", "m", "m", "m", "m"],
			]),
		];
		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("13x13 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", " ", "A", "B", " ", " ", " ", "J", "K", "L", "M", "N"],
			[" ", " ", "C", "D", "E", " ", "E", " ", " ", " ", " ", " ", " "],
			[" ", " ", "F", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", "G", " ", "H", "I", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", "D", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", "C", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", "F", " ", "G", " ", " ", "H", "B", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", "I", " ", " ", " ", " ", " "],
			["J", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["K", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["L", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["M", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["N", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
		]);
		const expected = [
			FlowGridShorthand.toGrid([
				["A", "a", "a", "A", "B", "b", "b", "b", "J", "K", "L", "M", "N"],
				["c", "c", "C", "D", "E", "e", "E", "b", "j", "k", "l", "m", "n"],
				["c", "f", "F", "d", "h", "h", "h", "b", "j", "k", "l", "m", "n"],
				["c", "f", "G", "d", "H", "I", "h", "b", "j", "k", "l", "m", "n"],
				["c", "f", "g", "d", "D", "i", "h", "b", "j", "k", "l", "m", "n"],
				["c", "f", "g", "C", "c", "i", "h", "b", "j", "k", "l", "m", "n"],
				["c", "F", "g", "G", "c", "i", "H", "B", "j", "k", "l", "m", "n"],
				["c", "c", "c", "c", "c", "i", "i", "I", "j", "k", "l", "m", "n"],
				["J", "j", "j", "j", "j", "j", "j", "j", "j", "k", "l", "m", "n"],
				["K", "k", "k", "k", "k", "k", "k", "k", "k", "k", "l", "m", "n"],
				["L", "l", "l", "l", "l", "l", "l", "l", "l", "l", "l", "m", "n"],
				["M", "m", "m", "m", "m", "m", "m", "m", "m", "m", "m", "m", "n"],
				["N", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n"],
			]),
		];
		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});

	test("14x14 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", " ", " ", "A", "B", " ", " ", " ", "J", "K", "L", "M", "N", "O"],
			[" ", " ", "C", "D", "E", " ", "E", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", "F", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", "G", " ", "H", "I", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", "D", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", "C", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", "F", " ", "G", " ", " ", "H", "B", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", "I", " ", " ", " ", " ", " ", " "],
			["J", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["K", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["L", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["M", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["N", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			["O", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
		]);
		const expected = [
			FlowGridShorthand.toGrid([
				["A", "a", "a", "A", "B", "b", "b", "b", "J", "K", "L", "M", "N", "O"],
				["c", "c", "C", "D", "E", "e", "E", "b", "j", "k", "l", "m", "n", "o"],
				["c", "f", "F", "d", "h", "h", "h", "b", "j", "k", "l", "m", "n", "o"],
				["c", "f", "G", "d", "H", "I", "h", "b", "j", "k", "l", "m", "n", "o"],
				["c", "f", "g", "d", "D", "i", "h", "b", "j", "k", "l", "m", "n", "o"],
				["c", "f", "g", "C", "c", "i", "h", "b", "j", "k", "l", "m", "n", "o"],
				["c", "F", "g", "G", "c", "i", "H", "B", "j", "k", "l", "m", "n", "o"],
				["c", "c", "c", "c", "c", "i", "i", "I", "j", "k", "l", "m", "n", "o"],
				["J", "j", "j", "j", "j", "j", "j", "j", "j", "k", "l", "m", "n", "o"],
				["K", "k", "k", "k", "k", "k", "k", "k", "k", "k", "l", "m", "n", "o"],
				["L", "l", "l", "l", "l", "l", "l", "l", "l", "l", "l", "m", "n", "o"],
				["M", "m", "m", "m", "m", "m", "m", "m", "m", "m", "m", "m", "n", "o"],
				["N", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "o"],
				["O", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o"],
			]),
		];
		const config = { distance: FlowGrid.distance(grid) };
		const actual = FlowAlgoSolve.solve(config, grid);

		expect(
			some(actual, (actual) =>
				expected.some((expected) => Flow.isSame(actual, expected)),
			),
		).toBe(true);
	});
});
