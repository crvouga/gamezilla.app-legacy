import { describe, expect, it, test } from "bun:test";
import { eq } from "gamezilla-app/@/core";
import { FlowGrid, FlowGridDimensions } from ".";
import { Flow } from "../../flow";

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

	
});
