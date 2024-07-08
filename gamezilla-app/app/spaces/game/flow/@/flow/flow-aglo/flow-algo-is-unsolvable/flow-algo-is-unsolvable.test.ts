import { describe, expect, test } from "bun:test";

import { FlowGridShorthand } from "../../flow-variant/flow-grid";
import * as FlowAlgoIsUnsolvable from "./flow-algo-is-unsolvable";

describe(import.meta.file, () => {
	test("solvable 3x3 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", "B", "C"],
			[" ", " ", " "],
			["A", "B", "C"],
		]);
		expect(FlowAlgoIsUnsolvable.isUnsolvable(grid)).toBe(false);
	});

	test.todo("unsolvable 3x3 puzzle", () => {
		const grid = FlowGridShorthand.toGrid([
			["A", "B", "A"],
			[" ", " ", " "],
			["C", "B", "C"],
		]);
		expect(FlowAlgoIsUnsolvable.isUnsolvable(grid)).toBe(true);
	});

	test.todo("unsolvable 8x8", () => {
		const grid = FlowGridShorthand.toGrid([
			["C", " ", " ", "D", " ", " ", " ", "A"],
			[" ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", " "],
			["B", " ", " ", " ", " ", " ", " ", "B"],
			[" ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", " "],
			["A", " ", " ", "D", " ", " ", " ", "C"],
		]);
		expect(FlowAlgoIsUnsolvable.isUnsolvable(grid)).toBe(true);
	});
});
