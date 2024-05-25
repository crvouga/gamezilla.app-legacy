import { describe, expect, it } from "bun:test";
import { Flow } from "../../@/flow";
import { FlowPack } from "../../@/flow-pack";
import { FlowPuzzle } from "../../@/flow-puzzle";
import { CoreFixture } from "../@/testing";

describe(import.meta.file, () => {
	it("should close puzzle after clicking exit puzzle button", async () => {
		const f = await CoreFixture();
		const puzzle = await FlowPuzzle.random();
		const pack = await FlowPack.random({
			puzzleIds: [puzzle.id],
		});

		const before = f.update(f.init, [
			{
				t: "user-clicked-open-pack-list-item",
				pack,
			},
			{
				t: "user-clicked-open-puzzle-grid-item",
				puzzle,
				puzzleIndex: 0,
			},
		]);

		const after = f.update(before, [
			{
				t: "user-clicked-exit-puzzle-button",
			},
		]);
		expect(before.screen.t).toEqual("screen-puzzle");
		expect(after.screen.t).toEqual("screen-pack");
	});

	it("should update puzzle screen flow play ui", async () => {
		const f = await CoreFixture();
		const puzzle = await FlowPuzzle.random();
		const terminal = Flow.randomTerminal(puzzle.flow)!;
		const pack = await FlowPack.random({
			puzzleIds: [puzzle.id],
		});
		const before = f.update(f.init, [
			{
				t: "user-clicked-open-pack-list-item",
				pack,
			},
			{
				t: "user-clicked-open-puzzle-grid-item",
				puzzle,
				puzzleIndex: 0,
			},
		]);

		const after = f.update(before, [
			{
				t: "got-puzzle-screen-flow-play-msg",
				c: {
					t: "pressed-down",
					nodeId: terminal.startId,
				},
			},
		]);

		if (
			before.screen.t === "screen-puzzle" &&
			after.screen.t === "screen-puzzle"
		) {
			expect(before.screen.flowPlay).not.toEqual(after.screen.flowPlay);
		}
	});

	it("should go to next puzzle after the user clicks the next button", async () => {
		const f = await CoreFixture();
		const puzzleA = await FlowPuzzle.random();
		const puzzleB = await FlowPuzzle.random();
		const pack = await FlowPack.random({
			puzzleIds: [puzzleA.id, puzzleB.id],
		});
		const before = f.update(f.init, [
			{
				t: "user-clicked-open-pack-list-item",
				pack,
			},
			{
				t: "user-clicked-open-puzzle-grid-item",
				puzzle: puzzleA,
				puzzleIndex: 0,
			},
		]);

		const after = f.update(before, [
			{
				t: "user-clicked-next-puzzle-button",
				nextPuzzle: puzzleB,
				nextPuzzleIndex: 1,
			},
		]);

		expect(
			before.screen.t === "screen-puzzle" ? before.screen.puzzleIndex : -1,
		).toEqual(0);
		expect(
			after.screen.t === "screen-puzzle" ? after.screen.puzzleIndex : -1,
		).toEqual(1);
	});

	it("should go to prev puzzle after the user clicks the prev button", async () => {
		const f = await CoreFixture();
		const puzzleA = await FlowPuzzle.random();
		const puzzleB = await FlowPuzzle.random();
		const pack = await FlowPack.random({
			puzzleIds: [puzzleA.id, puzzleB.id],
		});
		const before = f.update(f.init, [
			{
				t: "user-clicked-open-pack-list-item",
				pack,
			},
			{
				t: "user-clicked-open-puzzle-grid-item",
				puzzle: puzzleB,
				puzzleIndex: 1,
			},
		]);
		const after = f.update(before, [
			{
				t: "user-clicked-prev-puzzle-button",
				prevPuzzle: puzzleA,
				prevPuzzleIndex: 0,
			},
		]);
		expect(
			before.screen.t === "screen-puzzle" ? before.screen.puzzleIndex : -1,
		).toEqual(1);
		expect(
			after.screen.t === "screen-puzzle" ? after.screen.puzzleIndex : -1,
		).toEqual(0);
	});
});
