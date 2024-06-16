import { describe, expect, it } from "bun:test";
import { Flow, FlowVariantUIPlay } from "../../@/flow";
import { ScreenPuzzleCoreFixture } from "./@/testing.core";
import type { MsgCore } from "./screen-puzzle.types";

const Fixture = async () => {
	const f = await ScreenPuzzleCoreFixture();

	return {
		...f,
	};
};

describe(import.meta.file, () => {
	it("should close puzzle after clicking exit puzzle button", async () => {
		const f = await Fixture();
		const after = f.update(f.init, [
			{
				t: "user-clicked-exit-puzzle-button",
			},
		]);
		expect(f.init.screen.t).toEqual("screen-puzzle");
		expect(after.screen.t).toEqual("screen-pack");
	});

	it("should update puzzle screen flow play ui", async () => {
		const f = await Fixture();
		const after = f.update(
			f.init,
			FlowVariantUIPlay.randomMsgs({
				flow: f.puzzle.flow,
			}).map(
				(c): MsgCore => ({
					t: "got-puzzle-screen-flow-play-msg",
					c,
				}),
			),
		);

		if (
			f.init.screen.t === "screen-puzzle" &&
			after.screen.t === "screen-puzzle"
		) {
			expect(f.init.screen.flowPlay).not.toEqual(after.screen.flowPlay);
		}
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

		expect(
			f.init.screen.t === "screen-puzzle" ? f.init.screen.puzzleIndex : -1,
		).toEqual(f.puzzleIndex);
		expect(
			after.screen.t === "screen-puzzle" ? after.screen.puzzleIndex : -1,
		).toEqual(f.puzzleIndex + 1);
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
		expect(
			before.screen.t === "screen-puzzle" ? before.screen.puzzleIndex : -1,
		).toEqual(f.puzzleIndex + 1);
		expect(
			after.screen.t === "screen-puzzle" ? after.screen.puzzleIndex : -1,
		).toEqual(f.puzzleIndex);
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

		if (
			before.screen.t === "screen-puzzle" &&
			after.screen.t === "screen-puzzle"
		) {
			expect(before.screen.flowPlay).not.toEqual(after.screen.flowPlay);
			expect(after.screen.flowPlay).toEqual(
				FlowVariantUIPlay.init({ flow: f.nextPuzzle.flow }),
			);
		}
	});

	it("should go into puzzle solved state after solving", async () => {
		const f = await Fixture();
		const before = f.init;
		const after = f.update(before, f.completePuzzleMsgs);
		expect(before.screen.t).toBe("screen-puzzle");
		if (before.screen.t === "screen-puzzle") {
			expect(before.screen.state.t).toBe("solving");
		}
		expect(after.screen.t).toBe("screen-puzzle");
		if (after.screen.t === "screen-puzzle") {
			expect(after.screen.state.t).toBe("solved");
			const flow = FlowVariantUIPlay.deriveFlow({
				flow: f.puzzle.flow,
				model: after.screen.flowPlay,
			});
			expect(Flow.isSolved(flow)).toBe(true);
		}
	});

	it("should open puzzle complete dialog after solving", async () => {
		const f = await Fixture();

		const after = f.update(f.init, f.completePuzzleMsgs);

		expect(
			after.screen.t === "screen-puzzle" &&
				after.screen.state.t === "solved" &&
				after.screen.opened === "puzzle-complete",
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
		expect(
			after.screen.t === "screen-puzzle" &&
				after.screen.state.t === "solved" &&
				after.screen.opened === null,
		).toBe(true);
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
		expect(
			after.screen.t === "screen-puzzle" && after.screen.opened === null,
		).toBe(true);
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
		expect(
			before.screen.t === "screen-puzzle" && before.screen.opened === null,
		).toBe(true);
		expect(
			after.screen.t === "screen-puzzle" && after.screen.opened === null,
		).toBe(true);
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
		expect(
			before.screen.t === "screen-puzzle" &&
				before.screen.opened === "puzzle-complete",
		).toBe(true);
		expect(
			after.screen.t === "screen-puzzle" && after.screen.opened === null,
		).toBe(true);
	});

	it("should clear puzzle after clicking reset button", async () => {
		const f = await Fixture();
		const before = f.update(f.init, [
			...f.completePuzzleMsgs,
			{
				t: "user-clicked-reset-puzzle-button",
			},
		]);
		expect(before.screen.t).toBe("screen-puzzle");
		if (before.screen.t === "screen-puzzle")
			expect(before.screen.flowPlay).toEqual(FlowVariantUIPlay.init(f.puzzle));
	});

	it("should show hint after clicking show hint button", async () => {
		const f = await Fixture();
		const after = f.update(f.init, [
			{t: 'user-clicked-hint-button'}
		])
		expect(after.screen.t).toBe('screen-puzzle')
		if(after.screen.t === 'screen-puzzle') {
			expect(FlowVariantUIPlay.isShowingHint(after.screen.flowPlay)).toBe(true)
		}
	});
});
