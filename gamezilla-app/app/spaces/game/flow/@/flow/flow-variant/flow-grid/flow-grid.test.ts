import { describe, expect, it } from "bun:test";
import { FlowGrid, FlowGridDimensions } from ".";

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
});
