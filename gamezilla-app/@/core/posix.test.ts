import { describe, expect, it } from "bun:test";
import { Posix } from "./posix";

describe(import.meta.file, () => {
	it("should be able to be precise to the second", () => {
		const now = Posix.now({
			precision: "minutes",
		});
		const now2 = Posix.now({
			precision: "minutes",
		});
		expect(now).toEqual(now2);
	});
});
