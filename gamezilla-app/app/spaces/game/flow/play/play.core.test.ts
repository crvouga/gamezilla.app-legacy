import { describe, expect, it } from "bun:test";
import { FlowPack } from "../@/flow-pack";
import { CoreFixture } from "./@/testing";
import { FlowPuzzle } from "../@/flow-puzzle";
import { Flow } from "../@/flow";

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
		expect(after.screen.t).toEqual("screen-pack");
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
		expect(before.screen.t).toEqual("screen-pack");
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
				puzzle,
			},
		]);
		expect(before.screen.t).toEqual("screen-pack");
		expect(after.screen.t).toEqual("screen-puzzle");
		if (after.screen.t === "screen-puzzle") {
			expect(after.screen.flowPuzzle.id).toEqual(puzzle.id);
		}
	});

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
});
