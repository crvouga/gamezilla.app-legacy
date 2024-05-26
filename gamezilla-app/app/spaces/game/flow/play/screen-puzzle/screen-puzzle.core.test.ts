import { describe, expect, it } from "bun:test";
import { Flow, FlowVariantUIPlay } from "../../@/flow";
import { FlowPack } from "../../@/flow-pack";
import { FlowPuzzle } from "../../@/flow-puzzle";
import { CoreFixture } from "../@/testing";
import { MsgCore } from "./screen-puzzle.types";

const Fixture = async () => {
	const f = await CoreFixture();
	const puzzle = await FlowPuzzle.random();
	const puzzleIndex = 0;
	const nextPuzzle = await FlowPuzzle.random();
	const nextPuzzleIndex = 1;
	const pack = await FlowPack.random({
		puzzleIds: [puzzle.id, nextPuzzle.id],
	});

	const init = f.update(f.init, [
		{
			t: "user-clicked-open-pack-list-item",
			pack,
		},
		{
			t: "user-clicked-open-puzzle-grid-item",
			puzzle: puzzle,
			puzzleIndex,
		},
	]);

	return {
		...f,
		puzzle,
		puzzleIndex,
		nextPuzzle,
		nextPuzzleIndex,
		pack,
		init,
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
		).toEqual(0);
		expect(
			after.screen.t === "screen-puzzle" ? after.screen.puzzleIndex : -1,
		).toEqual(1);
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
		).toEqual(1);
		expect(
			after.screen.t === "screen-puzzle" ? after.screen.puzzleIndex : -1,
		).toEqual(0);
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

	it.todo('should be in puzzle completed state after the puzzle is completed', async () => {
		const f = await Fixture();

		const msgs = FlowVariantUIPlay.randomMsgs({
			flow: f.puzzle.flow,
		}).map(
			(c): MsgCore => ({
				t: "got-puzzle-screen-flow-play-msg",
				c,
			}),
		);

		const output = f.update(f.init, []);

		expect(output.screen.t === 'screen-puzzle' && output.screen.state)
	})
});
