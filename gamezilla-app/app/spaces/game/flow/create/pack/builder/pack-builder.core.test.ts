import { describe, expect, it } from "bun:test";
import { UserId } from "gamezilla-app/app/@/data";
import { SpaceGameCoreFixture } from "gamezilla-app/app/spaces/game/@/testing/sync";
import { FlowPackGridUI } from "../../../@/flow-pack/flow-pack-grid/flow-pack-grid-ui";
import { randomFlowPack, randomFlowPuzzle } from "../../../@/testing";
import { CreateCore } from "../../create.core";
import { ModelCore } from "../../create.types";
import { PackBuilderCore } from "./pack-builder.core";
import { MsgCore } from "./pack-builder.types";
import { FlowPuzzle } from "../../../@/flow-puzzle";

const Fixture = async (input?: { puzzleCount?: number }) => {
	const f = await SpaceGameCoreFixture();
	const createdBy = UserId.generate();

	const puzzles: [FlowPuzzle, FlowPuzzle, FlowPuzzle, ...FlowPuzzle[]] = [
		await randomFlowPuzzle({ createdBy }),
		await randomFlowPuzzle({ createdBy }),
		await randomFlowPuzzle({ createdBy }),
	];
	for (let i = 0; i < (input?.puzzleCount ?? 0); i++) {
		puzzles.push(await randomFlowPuzzle({ createdBy }));
	}

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
			slideIndex: 0,
			screen: {
				t: "screen-puzzle-grid",
			},
		},
	};

	const updateModelCore = (msgs: MsgCore[]): ModelCore => {
		return msgs.reduce(
			(modelCore, msgCore) =>
				PackBuilderCore.updateCore({ ctx: f.ctx, modelCore, msgCore }),
			{ ...modelCore },
		);
	};

	return {
		...f,
		updateModelCore,
		currentUserId: createdBy,
		pack,
		puzzles,
		modelCore,
	};
};

describe(import.meta.file, () => {
	it("should remove puzzle from pack after clicking remove button", async () => {
		const f = await Fixture();

		const modelCore = f.updateModelCore([
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

		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.puzzle-screen.user-clicked-exit-puzzle-button",
				userId: f.currentUserId,
			},
		]);

		expect(modelCore.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
	});

	it("should open puzzle screen when clicking puzzle grid item", async () => {
		const f = await Fixture();

		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[0],
			},
		]);

		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder.screen.puzzle.id === f.puzzles[0].id,
		).toBe(true);
	});

	it("should be able to exit pack builder", async () => {
		const f = await Fixture();
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-clicked-exit-button",
				userId: f.currentUserId,
			},
		]);
		expect(modelCore.opened.t !== "puzzle-builder").toBe(true);
	});

	it("should be able to open 'more' drawer", async () => {
		const f = await Fixture();
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[0],
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
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[0],
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
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[0],
			},
			{
				t: "pack-builder.puzzle-screen.user-clicked-next-puzzle-button",
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
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[0],
			},
			{
				t: "pack-builder.puzzle-screen.user-clicked-next-puzzle-button",
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
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[1],
			},
			{
				t: "pack-builder.puzzle-screen.user-clicked-previous-puzzle-button",
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
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[1],
			},
			{
				t: "pack-builder.puzzle-screen.user-clicked-previous-puzzle-button",
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
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle: f.puzzles[1],
			},
			{
				t: "pack-builder.puzzle-screen.user-clicked-exit-puzzle-button",
				userId: f.currentUserId,
			},
		]);
		expect(modelCore.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
	});

	it("should be able to open add puzzle screen", async () => {
		const f = await Fixture();
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-opened-add-puzzle-screen",
				userId: f.currentUserId,
			},
		]);
		expect(modelCore.packBuilder?.screen.t === "screen-add-puzzle").toBe(true);
	});

	it("should be able to close add puzzle screen", async () => {
		const f = await Fixture();
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-opened-add-puzzle-screen",
				userId: f.currentUserId,
			},
			{
				t: "pack-builder.user-closed-add-puzzle-screen",
			},
		]);
		expect(modelCore.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
	});

	it("should be able to add new puzzle", async () => {
		const f = await Fixture();
		const newPuzzle = await randomFlowPuzzle({ createdBy: f.currentUserId });
		const modelCore = f.updateModelCore([
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

	it("should be on the correct slide index after exiting the puzzle screen", async () => {
		const f = await Fixture({
			puzzleCount: FlowPackGridUI.PER_SLIDE_ITEM_COUNT + 1,
		});

		const puzzle = await randomFlowPuzzle({ createdBy: f.currentUserId });

		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-clicked-add-puzzle-item",
				puzzle,
				userId: f.currentUserId,
			},
			{
				t: "pack-builder.user-clicked-pack-item",
				puzzle,
			},
			{
				t: "pack-builder.puzzle-screen.user-clicked-exit-puzzle-button",
				userId: f.currentUserId,
			},
		]);

		const expected = FlowPackGridUI.toSlideIndex(
			modelCore.packBuilder?.pack.puzzleIds.indexOf(puzzle.id) ?? 0,
		);
		const actual = PackBuilderCore.toSlideIndex(modelCore.packBuilder);
		expect(actual).toBe(expected);
	});

	it("should allow user to change slide", async () => {
		const f = await Fixture({
			puzzleCount: FlowPackGridUI.PER_SLIDE_ITEM_COUNT + 1,
		});

		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-changed-slide",
				newSlideIndex: 1,
				userId: f.currentUserId,
			},
		]);
		expect(PackBuilderCore.toSlideIndex(f.modelCore.packBuilder)).toBe(0);
		expect(PackBuilderCore.toSlideIndex(modelCore.packBuilder)).toBe(1);
	});

	it("should prevent slide index from going out of bounds", async () => {
		const f = await Fixture({ puzzleCount: 3 });
		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-changed-slide",
				newSlideIndex: 10,
				userId: f.currentUserId,
			},
		]);
		expect(PackBuilderCore.toSlideIndex(f.modelCore.packBuilder)).toBe(0);
		expect(PackBuilderCore.toSlideIndex(modelCore.packBuilder)).toBe(0);
	});

	it("should be on the correct slide when closing the add puzzle screen", async () => {
		const f = await Fixture({
			puzzleCount: FlowPackGridUI.PER_SLIDE_ITEM_COUNT + 1,
		});

		const modelCore = f.updateModelCore([
			{
				t: "pack-builder.user-changed-slide",
				newSlideIndex: 1,
				userId: f.currentUserId,
			},
			{
				t: "pack-builder.user-opened-add-puzzle-screen",
				userId: f.currentUserId,
			},
			{
				t: "pack-builder.user-closed-add-puzzle-screen",
			},
		]);

		expect(PackBuilderCore.toSlideIndex(f.modelCore.packBuilder)).toBe(0);
		expect(PackBuilderCore.toSlideIndex(modelCore.packBuilder)).toBe(1);
	});
});
