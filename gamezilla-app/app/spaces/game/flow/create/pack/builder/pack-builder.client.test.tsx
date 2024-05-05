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
import { deriveModelSync } from "../../@/testing/game";
import type { ModelClient, ModelSync } from "../../create.core";
import { PackBuilderClient } from "./pack-builder.client";
import { CreateSync } from "../../create.sync";

const clickedMoreButton = (ctx: FlowClientCtx) => (model: ModelClient) => {
	return PackBuilderClient.update({
		ctx,
		model,
		modelSync: CreateSync.initSync({ ctx }),
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
		modelSync: CreateSync.initSync({ ctx }),
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
	const modelSync: ModelSync = {
		...f.modelSync,
		packBuilder: {
			t: "pack-builder",
			pack: pack,
			screen: {
				t: "add-puzzle",
			},
		},
	};
	return {
		...f,
		pack,
		puzzle,
		model,
		modelSync,
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
		const modelSync = deriveModelSync(ctx)(output);
		expect(
			modelSync.packBuilder?.screen.t === "screen-puzzle" &&
				modelSync.packBuilder.screen.puzzleIndex === 0,
		).toBe(true);
	});

	it("should open puzzle picker when user clicks add puzzle button", async () => {
		const ctx = await testFlowClientCtx();
		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedOpenPuzzlePickerButton(ctx),
		);
		const modelSync = deriveModelSync(ctx)(output);
		expect(modelSync.packBuilder?.screen.t === "add-puzzle").toBe(true);
	});

	it("should close puzzle picker when user clicks closes", async () => {
		const ctx = await testFlowClientCtx();
		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedOpenPuzzlePickerButton(ctx),
			closedPuzzlePickerDrawer(ctx),
		);
		const modelSync = deriveModelSync(ctx)(output);
		expect(modelSync.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
	});

	it("should add puzzle to the pack after clicking a puzzle in the picker", async () => {
		const ctx = await testFlowClientCtx();
		const puzzle = await createFlowPuzzle(ctx);
		const output = andThen(
			initial,
			serverCreatedPack(ctx, await createFlowPack(ctx)),
			clickedPuzzlePickerItem(ctx, puzzle),
		);
		const modelSync = deriveModelSync(ctx)(output);
		expect(
			modelSync.packBuilder &&
				FlowPack.includes(modelSync.packBuilder.pack, puzzle.id),
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
		const modelSync = deriveModelSync(ctx)(output);
		expect(modelSync.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
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
		const modelSync = deriveModelSync(ctx)(output);
		expect(modelSync.packBuilder?.screen.t === "screen-puzzle-grid").toBe(true);
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
		const modelSync = deriveModelSync(ctx)(output);
		expect(
			modelSync.packBuilder?.screen.t === "screen-puzzle" &&
				modelSync.packBuilder?.screen.opened === "more",
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
		const modelSync = deriveModelSync(ctx)(output);
		expect(
			modelSync.packBuilder?.screen.t === "screen-puzzle" &&
				modelSync.packBuilder?.screen.opened === null,
		).toBe(true);
	});

	it("should should remove puzzle from pack clicking remove from pack button", async () => {
		const f = await Fixture();
		const output = PackBuilderClient.update({
			...f,
			msg: {
				t: "pack-builder.puzzle-screen.user-clicked-remove-from-pack-button",
				userId: f.ctx.currentUserId,
				puzzleIndex: f.pack.puzzleIds.indexOf(f.puzzle.id),
			},
		});
		expect(
			output.msgSync?.some(
				(msg) =>
					msg.t ===
					"pack-builder.puzzle-screen.user-clicked-remove-from-pack-button",
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
			modelSync: {
				...f.modelSync,
				packBuilder: {
					t: "pack-builder",
					pack: updatedPack,
					screen: {
						t: "add-puzzle",
					},
				},
			},
		});
		const after = { ...output.model.packs[f.pack.id] };
		expect(before).toEqual(f.pack);
		expect(after).toEqual(updatedPack);
	});
});
