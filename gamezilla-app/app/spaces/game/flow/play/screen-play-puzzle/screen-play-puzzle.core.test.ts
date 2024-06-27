import { describe, expect, it } from "bun:test";
import { Flow, FlowVariantPlay, type FlowVariant } from "../../@/flow";
import { ScreenPuzzleCoreFixture } from "./@/testing.core";
import { ScreenPuzzleCore } from "./screen-play-puzzle.core";
import type { ModelCore, MsgCore } from "./screen-play-puzzle.types";

const Fixture = async (input?: { flow?: FlowVariant.Model }) => {
	const f = await ScreenPuzzleCoreFixture(input);

	const update = (init: ModelCore, msgs: MsgCore[]): ModelCore => {
		let model: ModelCore = init;
		for (const msg of msgs) {
			model = ScreenPuzzleCore.updateScreen(model, msg);
		}
		return model;
	};

	const init: ModelCore = ScreenPuzzleCore.initCore({
		flowPack: f.pack,
		flowPuzzle: f.puzzle,
		puzzleIndex: f.puzzleIndex,
	});

	return {
		...f,
		initParent: f.init,
		updateParent: f.update,
		update,
		init,
	};
};

describe(import.meta.file, () => {
	it("should close puzzle after clicking exit puzzle button", async () => {
		const f = await Fixture();
		const after = f.updateParent(f.initParent, [
			{
				t: "user-clicked-exit-puzzle-button",
			},
		]);
		expect(f.initParent.screen.t).toEqual("screen-play-puzzle");
		expect(after.screen.t).toEqual("screen-select-puzzle");
	});

	it("should update puzzle screen flow play ui", async () => {
		const f = await Fixture();
		const after = f.update(
			f.init,
			FlowVariantPlay.randomMsgs(f.puzzle).map(
				(c): MsgCore => ({
					t: "got-puzzle-screen-flow-play-msg",
					c,
				}),
			),
		);

		expect(f.init.flowPlay).not.toEqual(after.flowPlay);
	});

	it("should go to next puzzle after the user clicks the next button", async () => {
		const f = await Fixture();
		const after = f.update(f.init, [
			{
				t: "user-clicked-next-puzzle-button",
				nextPuzzle: f.nextPuzzle,
				nextPuzzleIndex: f.nextPuzzleIndex,
			},
		]);

		expect(f.init.puzzleIndex).toEqual(f.puzzleIndex);
		expect(after.puzzleIndex).toEqual(f.puzzleIndex + 1);
	});

	it("should go to prev puzzle after the user clicks the prev button", async () => {
		const f = await Fixture();
		const before = f.update(f.init, [
			{
				t: "user-clicked-next-puzzle-button",
				nextPuzzle: f.nextPuzzle,
				nextPuzzleIndex: f.nextPuzzleIndex,
			},
		]);
		const after = f.update(before, [
			{
				t: "user-clicked-prev-puzzle-button",
				prevPuzzle: f.puzzle,
				prevPuzzleIndex: f.puzzleIndex,
			},
		]);
		expect(before.puzzleIndex).toEqual(f.puzzleIndex + 1);
		expect(after.puzzleIndex).toEqual(f.puzzleIndex);
	});

	it("should start with empty puzzle after going to next puzzle", async () => {
		const f = await Fixture();

		const msgs = FlowVariantPlay.randomMsgs({
			flow: f.puzzle.flow,
		}).map(
			(c): MsgCore => ({
				t: "got-puzzle-screen-flow-play-msg",
				c,
			}),
		);

		const before = f.update(f.init, msgs);
		const after = f.update(f.init, [
			{
				t: "user-clicked-next-puzzle-button",
				nextPuzzle: f.nextPuzzle,
				nextPuzzleIndex: f.nextPuzzleIndex,
			},
		]);

		expect(before.flowPlay).not.toEqual(after.flowPlay);
		expect(after.flowPlay).toEqual(
			FlowVariantPlay.init({ flow: f.nextPuzzle.flow }),
		);
	});

	it("should go into puzzle solved state after solving", async () => {
		const f = await Fixture();
		const before = f.init;
		const after = f.update(before, f.completePuzzleMsgs);
		const afterFlow = FlowVariantPlay.deriveFlow({
			flow: f.puzzle.flow,
			model: after.flowPlay,
		});

		expect(before.state.t).toBe("solving");
		expect(after.state.t).toBe("solved");
		expect(Flow.isSolved(afterFlow)).toBe(true);
	});

	it("should open puzzle complete dialog after solving", async () => {
		const f = await Fixture();

		const after = f.update(f.init, f.completePuzzleMsgs);

		expect(
			after.state.t === "solved" && after.opened === "puzzle-complete",
		).toBe(true);
	});

	it("should be able to close the puzzle complete dialog", async () => {
		const f = await Fixture();
		const before = f.update(f.init, f.completePuzzleMsgs);
		const after = f.update(before, [
			{
				t: "user-closed-puzzle-complete-dialog",
			},
		]);
		expect(after.state.t === "solved" && after.opened === null).toBe(true);
	});

	it("should close puzzle complete dialog after clicking next puzzle button", async () => {
		const f = await Fixture();
		const before = f.update(f.init, f.completePuzzleMsgs);
		const after = f.update(before, [
			{
				t: "user-clicked-next-puzzle-button",
				nextPuzzle: f.nextPuzzle,
				nextPuzzleIndex: f.nextPuzzleIndex,
			},
		]);
		expect(after.opened === null).toBe(true);
	});

	it("should only open puzzle complete dialog when transitions to solved state", async () => {
		const f = await Fixture();
		const endId = Flow.randomTerminal(f.puzzle.flow)?.endId;

		if (!endId) throw new Error("endId not found");

		const before = f.update(f.init, [
			...f.completePuzzleMsgs,
			{
				t: "user-closed-puzzle-complete-dialog",
			},
		]);
		const after = f.update(before, [
			{
				t: "got-puzzle-screen-flow-play-msg",
				c: {
					t: "pressed-up",
					nodeId: endId,
				},
			},
		]);
		expect(before.opened === null).toBe(true);
		expect(after.opened === null).toBe(true);
	});

	it("should close puzzle complete dialog after clicking prev puzzle button", async () => {
		const f = await Fixture();
		const before = f.update(f.init, f.completePuzzleMsgs);
		const after = f.update(before, [
			{
				t: "user-clicked-prev-puzzle-button",
				prevPuzzle: f.prevPuzzle,
				prevPuzzleIndex: f.prevPuzzleIndex,
			},
		]);
		expect(before.opened === "puzzle-complete").toBe(true);
		expect(after.opened === null).toBe(true);
	});

	it("should clear puzzle after clicking reset button", async () => {
		const f = await Fixture();
		const before = f.update(f.init, [
			...f.completePuzzleMsgs,
			{
				t: "user-clicked-reset-puzzle-button",
			},
		]);
		expect(before.flowPlay).toEqual(FlowVariantPlay.init(f.puzzle));
	});

	it("should be in a solving state after going to the next puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.init, [
			...f.completePuzzleMsgs,
			{
				t: "user-clicked-next-puzzle-button",
				nextPuzzle: f.nextPuzzle,
				nextPuzzleIndex: f.nextPuzzleIndex,
			},
		]);
		expect(output.state.t).toBe("solving");
	});

	it("should be in a solving state after going to the prev puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.init, [
			...f.completePuzzleMsgs,
			{
				t: "user-clicked-prev-puzzle-button",
				prevPuzzle: f.prevPuzzle,
				prevPuzzleIndex: f.prevPuzzleIndex,
			},
		]);
		expect(output.state.t).toBe("solving");
	});
});
