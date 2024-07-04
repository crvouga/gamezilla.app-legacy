import { describe, expect, it } from "bun:test";
import { Result } from "gamezilla-app/@/core";
import { FlowGridShorthand } from "../../flow/flow-variant/flow-grid";
import { FlowPuzzle } from "../flow-puzzle";
import { FlowPuzzleDbFixture } from "./fixture";
import { WithSolutions } from "./with-solutions";

const Fixture = async () => {
	const f = await FlowPuzzleDbFixture();

	const puzzleWithEmptySolutions = await FlowPuzzle.random({
		flow: FlowGridShorthand.toGrid([
			["A", " "],
			[" ", "A"],
		]),
	});
	puzzleWithEmptySolutions.flowSolutions = [];

	return {
		...f,
		puzzleWithEmptySolutions,
		withSolutions: WithSolutions(f.flowPuzzleDb),
	};
};

describe(import.meta.file, () => {
	it("should assoc solutions before put", async () => {
		const f = await Fixture();
		const before = Result.unwrap(
			await f.flowPuzzleDb.get(f.puzzleWithEmptySolutions.id),
		);
		await f.withSolutions.put(f.puzzleWithEmptySolutions);
		const after = Result.unwrap(
			await f.flowPuzzleDb.get(f.puzzleWithEmptySolutions.id),
		);
		expect((before?.flowSolutions.length ?? 0) === 0).toBe(true);
		expect((after?.flowSolutions.length ?? 0) > 0).toBe(true);
	});

	it.todo("should assoc solutions before get", async () => {
		const f = await Fixture();
		const before = Result.unwrap(
			await f.withSolutions.get(f.puzzleWithEmptySolutions.id),
		);
		await f.flowPuzzleDb.put(f.puzzleWithEmptySolutions);
		const after = Result.unwrap(
			await f.withSolutions.get(f.puzzleWithEmptySolutions.id),
		);
		expect((before?.flowSolutions.length ?? 0) === 0).toBe(true);
		expect((after?.flowSolutions.length ?? 0) > 0).toBe(true);
	});

	it.todo("should assoc solutions before list", async () => {
		const f = await Fixture();

		const before = Result.unwrap(
			await f.flowPuzzleDb.list({
				where: {
					puzzleId: {
						in: [f.puzzleWithEmptySolutions.id],
					},
				},
				order: {
					createdAt: "asc",
				},
				pagination: {
					limit: 10,
					offset: 0,
				},
			}),
		);
		await f.flowPuzzleDb.put(f.puzzleWithEmptySolutions);
		const after = Result.unwrap(
			await f.withSolutions.list({
				where: {
					puzzleId: {
						in: [f.puzzleWithEmptySolutions.id],
					},
				},
				order: {
					createdAt: "asc",
				},
				pagination: {
					limit: 10,
					offset: 0,
				},
			}),
		);
		expect(before?.items.length === 0).toBe(true);
		expect(after?.items.length === 1).toBe(true);
		for (const item of after?.items ?? []) {
			expect(item?.flowSolutions.length > 0).toBe(true);
		}
	});
});
