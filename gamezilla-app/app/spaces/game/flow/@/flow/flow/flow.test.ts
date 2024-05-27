import { describe, expect, test } from "bun:test";
import { Flow } from "../../flow";
import { FlowGridShorthand } from "../flow-variant/flow-grid";

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
});
