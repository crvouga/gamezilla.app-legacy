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
    
    test('find solutions for adjacent terminals', () => {
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
    })
});
