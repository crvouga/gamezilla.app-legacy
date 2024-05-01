import { describe, expect, test } from "bun:test";
import { takeWhile } from "./take-while";

const isNeg = (x: number) => x < 0;

describe(import.meta.file, () => {
	test("takeWhile", async () => {
		expect(takeWhile([-2, -1, 0, 1, 2], isNeg)).toEqual([-2, -1]);
		expect(takeWhile([-2, -1], isNeg)).toEqual([-2, -1]);
		expect(takeWhile([1, 2, 3], isNeg)).toEqual([]);
		expect(takeWhile([], isNeg)).toEqual([]);
	});
});
