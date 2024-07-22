import { describe, expect, it } from "bun:test";
import { FlowPack } from "../@/flow-pack";
import { FlowPuzzle } from "../@/flow-puzzle";
import { CoreFixture } from "./@/fixture";

describe(import.meta.file, () => {
	it("should be able to open pack from list", async () => {
		const f = await CoreFixture();
		const before = f.init;
		const after = f.update(before, [
			{
				t: "user-clicked-open-pack-list-item",
				pack: await FlowPack.random(),
			},
		]);

		expect(before.screen.t).toEqual("screen-select-pack");
		expect(after.screen.t).toEqual("screen-select-puzzle");
	});

	it("should exit to select pack screen after clicking exit button", async () => {
		const f = await CoreFixture();
		const before = f.update(f.init, [
			{
				t: "user-clicked-open-pack-list-item",
				pack: await FlowPack.random(),
			},
		]);
		const after = f.update(before, [
			{
				t: "user-clicked-exit-pack-button",
			},
		]);
		expect(before.screen.t).toEqual("screen-select-puzzle");
		expect(after.screen.t).toEqual("screen-select-pack");
	});

	it("should open puzzle from pack", async () => {
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
		]);

		const after = f.update(before, [
			{
				t: "user-clicked-open-puzzle-grid-item",
				flowPuzzle: puzzle,
				puzzleIndex: 0,
			},
		]);
		expect(before.screen.t).toEqual("screen-select-puzzle");
		expect(after.screen.t).toEqual("screen-play-puzzle");
		if (after.screen.t === "screen-play-puzzle") {
			expect(after.screen.flowPuzzle.id).toEqual(puzzle.id);
		}
	});
});
