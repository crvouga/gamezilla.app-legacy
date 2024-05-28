import { describe, expect, test } from "bun:test";
import * as FlowGridShorthandString from "./flow-grid-shorthand-string";
import * as FlowGridShorthand from "./flow-grid-shorthand";

describe(import.meta.file, () => {
	test("3x3", () => {
		const stringShorthand = `
            123
            .23
            ..1
        `;
		const expected = FlowGridShorthand.init([
			["A", "B", "C"],
			[" ", "B", "C"],
			[" ", " ", "A"],
		]);
		const actual =
			FlowGridShorthandString.numberStringToShorthand(stringShorthand);

		expect(actual).toEqual(expected);
	});

	test("5x5", () => {
		const stringShorthand = `
            12..4
            .3.34
            .5.55
            6.7.8
            6.7.8
        `;
		const expected = FlowGridShorthand.init([
			["A", "B", " ", " ", "D"],
			[" ", "C", " ", "C", "D"],
			[" ", "E", " ", "E", "E"],
			["F", " ", "G", " ", "H"],
			["F", " ", "G", " ", "H"],
		]);
		const actual =
			FlowGridShorthandString.numberStringToShorthand(stringShorthand);

		expect(actual).toEqual(expected);
	});

	test("10x10", async () => {
		const stringShorthand = `
            1.........
            ..........
            ....2.....
            ..........
            ....3.....
            ..........
            ....4.....
            ..........
            ....5.....
            .........
        `;
		const expected = FlowGridShorthand.init([
			["A", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", "B", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", "C", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", "D", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", "E", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
		]);
		const actual =
			FlowGridShorthandString.numberStringToShorthand(stringShorthand);

		expect(actual).toEqual(expected);
	});
});
