import { describe, expect, it } from "bun:test";
import { Flow, FlowVariantUIPlay } from "../../@/flow";
import { ScreenPuzzleCoreFixture } from "./@/testing.core";
import type { ModelCore, MsgCore } from "./screen-play-puzzle.types";
import { ScreenPuzzleCore } from "./screen-play-puzzle.core";

const Fixture = async () => {
	const f = await ScreenPuzzleCoreFixture();

	const update = (model: ModelCore, msgs: MsgCore[]): ModelCore => {
		const updated = f.update(
			{
				screen: model,
			},
			msgs,
		);
		if (updated.screen.t !== "screen-play-puzzle") {
			throw new Error("screen is not screen-play-puzzle");
		}
		return updated.screen;
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
			FlowVariantUIPlay.randomMsgs(f.puzzle).map(
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

		const msgs = FlowVariantUIPlay.randomMsgs({
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
			FlowVariantUIPlay.init({ flow: f.nextPuzzle.flow }),
		);
	});

	it("should go into puzzle solved state after solving", async () => {
		const f = await Fixture();
		const before = f.init;
		const after = f.update(before, f.completePuzzleMsgs);
		const afterFlow = FlowVariantUIPlay.deriveFlow({
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
		expect(before.flowPlay).toEqual(FlowVariantUIPlay.init(f.puzzle));
	});

	it("should show hint after clicking show hint button", async () => {
		const f = await Fixture();
		const after = f.update(f.init, [{ t: "user-clicked-hint-button" }]);
		expect(ScreenPuzzleCore.isAnyShowingHint(after)).toBe(true);
	});

	it("should add pipes to flow play model after showing hint", async () => {
		const f = await Fixture();
		const after = f.update(f.init, [{ t: "user-clicked-hint-button" }]);
		expect(after.t).toBe("screen-play-puzzle");

		for (const groupId of ScreenPuzzleCore.toShowingHintGroupIds(after)) {
			const flow = FlowVariantUIPlay.deriveFlow({
				flow: f.puzzle.flow,
				model: after.flowPlay,
			});
			expect(Flow.isTerminalConnectedWithPipes(flow, groupId)).toBe(true);
		}
	});
});
