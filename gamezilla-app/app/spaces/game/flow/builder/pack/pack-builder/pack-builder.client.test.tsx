import { describe, expect, it } from "bun:test";
import { andThen } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import type { FlowClientCtx } from "../../../@/flow-ctx";
import { FlowPack } from "../../../@/flow-pack/flow-pack";
import { randomFlowPack, randomFlowPuzzle } from "../../../@/testing";
import {
	FlowCreateFixtureClient,
	clickedExitPuzzleButton,
	clickedOpenPuzzlePickerButton,
	clickedPuzzleGridItem,
	clickedPuzzlePickerItem,
	closedPuzzlePickerDrawer,
	createFlowPack,
	createFlowPuzzle,
	initial,
	serverCreatedPack,
	testFlowClientCtx,
} from "../../@/testing/client";
import { deriveModelCore } from "../../@/testing/game";
import type { ModelClient, ModelCore } from "../../builder.types";
import { PackBuilderClient } from "./pack-builder.client";
import { BuilderCore } from "../../builder.core";
import { PackBuilderCore } from "./pack-builder.core";

const clickedMoreButton = (ctx: FlowClientCtx) => (model: ModelClient) => {
	return PackBuilderClient.update({
		ctx,
		model,
		modelCore: BuilderCore.initCore({ ctx }),
		msg: {
			t: "pack-builder.puzzle-screen.user-clicked-more-button",
			userId: ctx.currentUserId,
		},
	});
};

const closedMoreDrawer = (ctx: FlowClientCtx) => (model: ModelClient) => {
	return PackBuilderClient.update({
		ctx,
		model,
		modelCore: BuilderCore.initCore({ ctx }),
		msg: {
			t: "pack-builder.puzzle-screen.user-closed-more-drawer",
			userId: ctx.currentUserId,
		},
	});
};

export const Fixture = async () => {
	const f = await FlowCreateFixtureClient();
	const puzzle = await randomFlowPuzzle({
		createdBy: f.ctx.currentUserId,
	});
	const pack = await randomFlowPack({
		createdBy: f.ctx.currentUserId,
		puzzleIds: [puzzle.id],
	});
	const model: ModelClient = {
		...f.model,
		puzzles: {
			[puzzle.id]: puzzle,
		},
		packs: {
			[pack.id]: pack,
		},
	};
	const modelCore: ModelCore = {
		...f.modelCore,
		packBuilder: PackBuilderCore.init({
			pack,
		}),
	};
	return {
		...f,
		pack,
		puzzle,
		model,
		modelCore,
	};
};

describe(import.meta.file, () => {
	it("should open puzzle when user clickes puzzle grid item", async () => {
		const ctx = await testFlowClientCtx();
		const puzzle = await createFlowPuzzle(ctx);

		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedOpenPuzzlePickerButton(ctx),
			clickedPuzzlePickerItem(ctx, puzzle),
			clickedPuzzleGridItem(ctx, puzzle, 0),
		);
		const modelCore = deriveModelCore(ctx)(output);
		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder.screen.puzzleIndex === 0,
		).toBe(true);
	});

	it("should open puzzle picker when user clicks add puzzle button", async () => {
		const ctx = await testFlowClientCtx();
		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedOpenPuzzlePickerButton(ctx),
		);
		const modelCore = deriveModelCore(ctx)(output);
		expect(modelCore.packBuilder?.screen.t === "screen-add-puzzle").toBe(true);
	});

	it("should close puzzle picker when user clicks closes", async () => {
		const ctx = await testFlowClientCtx();
		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedOpenPuzzlePickerButton(ctx),
			closedPuzzlePickerDrawer(ctx),
		);
		const modelCore = deriveModelCore(ctx)(output);
		expect(modelCore.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
	});

	it("should add puzzle to the pack after clicking a puzzle in the picker", async () => {
		const ctx = await testFlowClientCtx();
		const puzzle = await createFlowPuzzle(ctx);
		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedPuzzlePickerItem(ctx, puzzle),
		);
		const modelCore = deriveModelCore(ctx)(output);
		expect(
			modelCore.packBuilder &&
				FlowPack.includes(modelCore.packBuilder.pack, puzzle.id),
		).toBe(true);
	});

	it("should close puzzle picker after adding a puzzle to the pack", async () => {
		const ctx = await testFlowClientCtx();
		const puzzle = await createFlowPuzzle(ctx);
		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedOpenPuzzlePickerButton(ctx),
			clickedPuzzlePickerItem(ctx, puzzle),
		);
		const modelCore = deriveModelCore(ctx)(output);
		expect(modelCore.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
	});

	it("should go back to grid after exiting puzzle", async () => {
		const ctx = await testFlowClientCtx();
		const puzzle = await createFlowPuzzle(ctx);
		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedOpenPuzzlePickerButton(ctx),
			clickedPuzzlePickerItem(ctx, puzzle),
			clickedPuzzleGridItem(ctx, puzzle, 0),
			clickedExitPuzzleButton(ctx),
		);
		const modelCore = deriveModelCore(ctx)(output);
		expect(modelCore.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
	});

	it('should open the more drawer after clicking "more" button', async () => {
		const ctx = await testFlowClientCtx();
		const puzzle = await createFlowPuzzle(ctx);
		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedOpenPuzzlePickerButton(ctx),
			clickedPuzzlePickerItem(ctx, puzzle),
			clickedPuzzleGridItem(ctx, puzzle, 0),
			clickedMoreButton(ctx),
		);
		const modelCore = deriveModelCore(ctx)(output);
		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder?.screen.opened === "more",
		).toBe(true);
	});

	it("should close the more drawer", async () => {
		const ctx = await testFlowClientCtx();
		const puzzle = await createFlowPuzzle(ctx);
		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedOpenPuzzlePickerButton(ctx),
			clickedPuzzlePickerItem(ctx, puzzle),
			clickedPuzzleGridItem(ctx, puzzle, 0),
			clickedMoreButton(ctx),
			closedMoreDrawer(ctx),
		);
		const modelCore = deriveModelCore(ctx)(output);
		expect(
			modelCore.packBuilder?.screen.t === "screen-puzzle" &&
				modelCore.packBuilder?.screen.opened === null,
		).toBe(true);
	});

	it("should should remove puzzle from pack clicking remove from pack button", async () => {
		const f = await Fixture();
		const output = PackBuilderClient.update({
			...f,
			msg: {
				t: "remove-puzzle-from-pack.user-clicked-remove-from-pack-button",
				userId: f.ctx.currentUserId,
				puzzleIndex: f.pack.puzzleIds.indexOf(f.puzzle.id),
			},
		});
		expect(
			output.msgCore?.some(
				(msg) =>
					msg.t ===
					"remove-puzzle-from-pack.user-clicked-remove-from-pack-button",
			),
		).toBe(true);
	});

	it("should update pack when pack changes in model sync", async () => {
		const f = await Fixture();
		const before = { ...f.model.packs[f.pack.id] };
		const updatedPack: FlowPack = {
			...f.pack,
			puzzleIds: [],
		};
		const output = PackBuilderClient.update({
			...f,
			modelCore: {
				...f.modelCore,
				packBuilder: PackBuilderCore.init({
					pack: updatedPack,
				}),
			},
		});
		const after = { ...output.model.packs[f.pack.id] };
		expect(before).toEqual(f.pack);
		expect(after).toEqual(updatedPack);
	});
});
