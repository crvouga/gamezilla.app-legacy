import { describe, expect, it } from "bun:test";
import { Result } from "gamezilla-app/@/core";
import { FlowPuzzle } from "../flow-puzzle";
import { FlowPuzzleDbFixture } from "./fixture";
import { WithSolutions } from "./with-solutions";
import { FlowGridShorthand } from "../../flow/flow-variant/flow-grid";

const Fixture = async () => {
    const f = await FlowPuzzleDbFixture()
	return {
        ...f,
        flowPuzzleDb: WithSolutions(f.flowPuzzleDb)
	}
};

describe(import.meta.file, () => {
	it('should assoc solutions', async () => {
		const f = await Fixture();
		const puzzle = await FlowPuzzle.random({
			flow: FlowGridShorthand.toGrid([
				["A", " "],
				[" ", "A"]
			])
		});
		const before = Result.unwrap(
			await f.flowPuzzleDb.get(puzzle.id)
		);
		await f.flowPuzzleDb.put(puzzle);
		const after = Result.unwrap(
			await f.flowPuzzleDb.get(puzzle.id)
		);
		expect((before?.flowSolutions.length ?? 0) === 0).toBe(true)
		expect((after?.flowSolutions.length ?? 0) > 0).toBe(true);
	})
});
