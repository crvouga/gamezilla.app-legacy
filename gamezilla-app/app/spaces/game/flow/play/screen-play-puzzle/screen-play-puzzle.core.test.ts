import { describe, expect, it, test } from "bun:test";
import { Flow, type FlowVariant } from "../../@/flow";
import { ScreenPuzzlePlayCoreChildFixture } from "./@/testing.core";
import type { MsgCore } from "./screen-play-puzzle.types";
import { ScreenPlayPuzzleCore } from "./screen-play-puzzle.core";
import {
	FlowGrid,
	FlowGridShorthand,
} from "../../@/flow/flow-variant/flow-grid";
import { FlowPlay } from "../../@/flow/flow-play";

const Fixture = async (input?: { flow?: FlowVariant.Model }) => {
	const f = await ScreenPuzzlePlayCoreChildFixture(input);

	return {
		...f,
	};
};

describe(import.meta.file, () => {
	it("should close puzzle after clicking exit puzzle button", async () => {
		const f = await Fixture();
		const after = f.updateParent(f.initParent, [
			{
				t: "user-clicked-exit-puzzle",
			},
		]);
		expect(f.initParent.screen.t).toEqual("screen-play-puzzle");
		expect(after.screen.t).toEqual("screen-select-puzzle");
	});

	it("should update puzzle screen flow play ui", async () => {
		const f = await Fixture();
		const after = f.update(
			f.init,
			FlowPlay.randomMsgs(f.puzzle).map(
				(c): MsgCore => ({
					t: "flow-variant-play",
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
				t: "user-clicked-next-puzzle",
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
				t: "user-clicked-next-puzzle",
				nextPuzzle: f.nextPuzzle,
				nextPuzzleIndex: f.nextPuzzleIndex,
			},
		]);
		const after = f.update(before, [
			{
				t: "user-clicked-prev-puzzle",
				prevPuzzle: f.puzzle,
				prevPuzzleIndex: f.puzzleIndex,
			},
		]);
		expect(before.puzzleIndex).toEqual(f.puzzleIndex + 1);
		expect(after.puzzleIndex).toEqual(f.puzzleIndex);
	});

	it("should start with empty puzzle after going to next puzzle", async () => {
		const f = await Fixture();

		const msgs = FlowPlay.randomMsgs({
			flow: f.puzzle.flow,
		}).map(
			(c): MsgCore => ({
				t: "flow-variant-play",
				c,
			}),
		);

		const before = f.update(f.init, msgs);
		const after = f.update(f.init, [
			{
				t: "user-clicked-next-puzzle",
				nextPuzzle: f.nextPuzzle,
				nextPuzzleIndex: f.nextPuzzleIndex,
			},
		]);

		expect(before.flowPlay).not.toEqual(after.flowPlay);
		expect(after.flowPlay).toEqual(FlowPlay.init({ flowPuzzle: f.nextPuzzle }));
	});

	it("should go into puzzle solved state after solving", async () => {
		const f = await Fixture();
		const before = f.init;
		const after = f.update(before, f.completePuzzleMsgs);
		const afterFlow = FlowPlay.toFlow({
			flow: f.puzzle.flow,
			model: after.flowPlay,
		});

		expect(ScreenPlayPuzzleCore.toStatus(before)).toBe("solving");
		expect(ScreenPlayPuzzleCore.toStatus(after)).toBe("solved");
		expect(Flow.isSolved(afterFlow)).toBe(true);
	});

	it("should open puzzle complete dialog after solving", async () => {
		const f = await Fixture();

		const after = f.update(f.init, f.completePuzzleMsgs);

		expect(
			ScreenPlayPuzzleCore.toStatus(after) === "solved" &&
				after.opened === "puzzle-complete",
		).toBe(true);
	});

	test("still in solved state after pressing solved board", async () => {
		const f = await Fixture({
			flow: FlowGridShorthand.toGrid([
				[" ", " ", "A"],
				[" ", " ", " "],
				[" ", " ", "A"],
			]),
		});
		const before = f.update(f.init, f.completePuzzleMsgs);
		const nodeId = FlowGrid.toNodeId({ x: 0, y: 0 });
		if (!nodeId) throw new Error("nodeId not found");
		const after = f.update(before, [
			{
				t: "flow-variant-play",
				c: {
					t: "user-pressed-down-node",
					nodeId,
				},
			},
		]);
		expect(ScreenPlayPuzzleCore.toStatus(after) === "solved").toBe(true);
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
			ScreenPlayPuzzleCore.toStatus(after) === "solved" &&
				after.opened === null,
		).toBe(true);
	});

	it("should close puzzle complete dialog after clicking next puzzle button", async () => {
		const f = await Fixture();
		const before = f.update(f.init, f.completePuzzleMsgs);
		const after = f.update(before, [
			{
				t: "user-clicked-next-puzzle",
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
				t: "flow-variant-play",
				c: {
					t: "user-pressed-up-node",
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
				t: "user-clicked-prev-puzzle",
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
				t: "user-clicked-reset-puzzle",
			},
		]);
		expect(before.flowPlay).toEqual(FlowPlay.init({ flowPuzzle: f.puzzle }));
	});

	it("should be in a solving state after going to the next puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.init, [
			...f.completePuzzleMsgs,
			{
				t: "user-clicked-next-puzzle",
				nextPuzzle: f.nextPuzzle,
				nextPuzzleIndex: f.nextPuzzleIndex,
			},
		]);
		expect(ScreenPlayPuzzleCore.toStatus(output)).toBe("solving");
	});

	it("should be in a solving state after going to the prev puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.init, [
			...f.completePuzzleMsgs,
			{
				t: "user-clicked-prev-puzzle",
				prevPuzzle: f.prevPuzzle,
				prevPuzzleIndex: f.prevPuzzleIndex,
			},
		]);
		expect(ScreenPlayPuzzleCore.toStatus(output)).toBe("solving");
	});

	test("open action drawer", async () => {
		const f = await Fixture();
		const output = f.update(f.init, [
			{
				t: "user-toggled-action-buttons-drawer",
			},
		]);
		expect(output.opened).toBe("action-drawer");
	});

	test("close action drawer", async () => {
		const f = await Fixture();
		const output = f.update(f.init, [
			{
				t: "user-toggled-action-buttons-drawer",
			},
			{
				t: "user-toggled-action-buttons-drawer",
			},
		]);
		expect(output.opened).toBe(null);
	});

	test("close action drawer", async () => {
		const f = await Fixture();
		const output = f.updates(f.init, [
			{ t: "user-toggled-action-buttons-drawer" },
			{ t: "user-clicked-copy-to-clipboard" },
		]);
		expect(output[0].opened).toBe(null);
	});
});
