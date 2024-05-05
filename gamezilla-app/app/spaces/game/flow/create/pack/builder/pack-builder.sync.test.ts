import { describe, expect, it } from "bun:test";
import { SpaceGameCoreFixture } from "gamezilla-app/app/spaces/game/@/testing/sync";
import { randomFlowPack, randomFlowPuzzle } from "../../../@/testing";
import { CreateCore } from "../../create.sync";
import { PackBuilderCore } from "./pack-builder.sync";
import { ModelCore } from "../../create.core";
import { MsgCore } from "./pack-builder.core";
import { UserId } from "gamezilla-app/app/@/data";

const Fixture = async () => {
	const f = await SpaceGameCoreFixture();
	const createdBy = UserId.generate();

	const puzzles = [
		await randomFlowPuzzle({ createdBy }),
		await randomFlowPuzzle({ createdBy }),
		await randomFlowPuzzle({ createdBy }),
	] as const;

	const pack = await randomFlowPack({
		createdBy,
		puzzleIds: puzzles.map((puzzle) => puzzle.id),
	});
	const init = CreateCore.initCore({ ctx: f.ctx });
	const modelCore: ModelCore = {
		...init,
		packBuilder: {
			t: "pack-builder",
			pack,
			screen: {
				t: "screen-puzzle-grid",
				pageIndex: 0,
			},
		},
	};

	const applyMsgs = (msgs: MsgCore[]) => {
		return msgs.reduce(
			(modelCore, msgCore) =>
				PackBuilderCore.updateCore({ ctx: f.ctx, modelCore, msgCore }),
			{ ...modelCore },
		);
	};

	return {
		...f,
		applyMsgs,
		currentUserId: createdBy,
		pack,
		puzzles,
		modelCore,
	};
};

describe(import.meta.file, () => {
	it("should remove puzzle from pack after clicking remove button", async () => {
		const f = await Fixture();

		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.puzzle-screen.user-clicked-remove-from-pack-button",
				userId: f.currentUserId,
				puzzleIndex: 0,
			},
		]);

		expect(
			modelCore.packBuilder?.pack.puzzleIds.includes(f.puzzles[0].id),
		).toBe(false);
	});

	it("should be able to exit puzzle screen", async () => {
		const f = await Fixture();

		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-exit-puzzle-button",
				userId: f.currentUserId,
			},
		]);

		expect(modelCore.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
	});

	it("should open puzzle screen when clicking puzzle grid item", async () => {
		const f = await Fixture();

		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[0],
				index: 0,
			},
		]);

		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder.screen.puzzle.id === f.puzzles[0].id,
		).toBe(true);
	});

	it("should be able to exit pack builder", async () => {
		const f = await Fixture();
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-exit-button",
				userId: f.currentUserId,
			},
		]);
		expect(modelCore.opened.t !== "puzzle-builder").toBe(true);
	});

	it("should be able to open 'more' drawer", async () => {
		const f = await Fixture();
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[0],
				index: 0,
			},
			{
				t: "pack-builder.puzzle-screen.user-clicked-more-button",
				userId: f.currentUserId,
			},
		]);
		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder?.screen.opened === "more",
		).toBe(true);
	});

	it("should be able to close 'more' drawer", async () => {
		const f = await Fixture();
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[0],
				index: 0,
			},
			{
				t: "pack-builder.puzzle-screen.user-closed-more-drawer",
				userId: f.currentUserId,
			},
		]);
		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder?.screen.opened === null,
		).toBe(true);
	});

	it("should be able to go to next puzzle", async () => {
		const f = await Fixture();
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[0],
				index: 0,
			},
			{
				t: "pack-builder.user-clicked-next-puzzle-button",
				userId: f.currentUserId,
				nextPuzzle: f.puzzles[1],
			},
		]);
		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder?.screen.puzzle.id === f.puzzles[1].id,
		).toBe(true);
	});

	it("should do nothing if next puzzle is not in pack", async () => {
		const f = await Fixture();
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[0],
				index: 0,
			},
			{
				t: "pack-builder.user-clicked-next-puzzle-button",
				userId: f.currentUserId,
				nextPuzzle: await randomFlowPuzzle({ createdBy: f.currentUserId }),
			},
		]);

		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder?.screen.puzzleIndex === 0,
		).toBe(true);
	});

	it("should be able to go to previous puzzle", async () => {
		const f = await Fixture();
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[1],
				index: 1,
			},
			{
				t: "pack-builder.user-clicked-previous-puzzle-button",
				userId: f.currentUserId,
				previousPuzzle: f.puzzles[0],
			},
		]);
		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder?.screen.puzzle.id === f.puzzles[0].id,
		).toBe(true);
	});

	it("should do nothing if previous puzzle is not in pack", async () => {
		const f = await Fixture();
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[1],
				index: 1,
			},
			{
				t: "pack-builder.user-clicked-previous-puzzle-button",
				userId: f.currentUserId,
				previousPuzzle: await randomFlowPuzzle({ createdBy: f.currentUserId }),
			},
		]);
		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder?.screen.puzzle.id === f.puzzles[1].id,
		).toBe(true);
	});

	it("should be able to exit puzzle screen", async () => {
		const f = await Fixture();
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[1],
				index: 1,
			},
			{
				t: "pack-builder.user-clicked-exit-puzzle-button",
				userId: f.currentUserId,
			},
		]);
		expect(modelCore.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
	});

	it("should be able to open add puzzle screen", async () => {
		const f = await Fixture();
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-open-add-puzzle-button",
				userId: f.currentUserId,
			},
		]);
		expect(modelCore.packBuilder?.screen.t === "add-puzzle").toBe(true);
	});

	it("should be able to close add puzzle screen", async () => {
		const f = await Fixture();
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-open-add-puzzle-button",
				userId: f.currentUserId,
			},
			{
				t: "pack-builder.user-closed-add-puzzle",
			},
		]);
		expect(modelCore.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
	});

	it("should be able to add new puzzle", async () => {
		const f = await Fixture();
		const newPuzzle = await randomFlowPuzzle({ createdBy: f.currentUserId });
		const modelCore = f.applyMsgs([
			{
				t: "pack-builder.user-clicked-add-puzzle-item",
				puzzle: newPuzzle,
				userId: f.currentUserId,
			},
		]);
		expect(modelCore.packBuilder?.pack.puzzleIds.includes(newPuzzle.id)).toBe(
			true,
		);
	});
});
