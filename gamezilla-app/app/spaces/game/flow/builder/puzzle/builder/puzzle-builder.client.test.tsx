import { describe, expect, it } from "bun:test";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import {
	clickedExitPuzzleBuilderButton,
	clickedPuzzleListItem,
	createFlowPuzzle,
	initial,
	puzzleBuilderPressDownRandomNode,
	serverListedPuzzlesOk,
	testFlowClientCtx,
} from "../../@/testing/client";
import { deriveModelCore } from "../../@/testing/game";

describe(import.meta.file, () => {
	it("should open puzzle builder on list item click", async () => {
		const ctx = await testFlowClientCtx();
		const puzzle = await createFlowPuzzle(ctx);
		const output = GameClientModule.andThen(
			initial,
			serverListedPuzzlesOk(ctx, [puzzle]),
			clickedPuzzleListItem(ctx, puzzle),
		);
		const modelCore = deriveModelCore(ctx)(output);
		expect(
			modelCore.opened.t === "puzzle-builder" &&
				modelCore.puzzleBuilder?.puzzle.id === puzzle.id,
		).toBe(true);
	});

	it("should exit puzzle builder after clicking exit button", async () => {
		const ctx = await testFlowClientCtx();
		const puzzle = await createFlowPuzzle(ctx);
		const openedBuilder = GameClientModule.andThen(
			initial,
			serverListedPuzzlesOk(ctx, [puzzle]),
			clickedPuzzleListItem(ctx, puzzle),
		);

		const output = GameClientModule.andThen(
			openedBuilder,
			clickedExitPuzzleBuilderButton(ctx, deriveModelCore(ctx)(openedBuilder)),
		);

		const modelCore = deriveModelCore(ctx)(output);

		expect(modelCore.opened.t === "list").toBe(true);
	});

	it("should open save prompt when exiting with unsaved changes", async () => {
		const ctx = await testFlowClientCtx();

		const puzzle = await createFlowPuzzle(ctx);

		const openedBuilder = GameClientModule.andThen(
			initial,
			serverListedPuzzlesOk(ctx, [puzzle]),
			clickedPuzzleListItem(ctx, puzzle),
		);

		const madeEdit = GameClientModule.andThen(
			openedBuilder,
			puzzleBuilderPressDownRandomNode(
				ctx,
				deriveModelCore(ctx)(openedBuilder),
			),
		);

		const output = GameClientModule.andThen(
			madeEdit,
			clickedExitPuzzleBuilderButton(ctx, deriveModelCore(ctx)(madeEdit)),
		);

		const modelCore = deriveModelCore(ctx)(output);

		expect(
			modelCore.opened.t === "puzzle-builder" &&
				output.model.puzzleBuilderOpened === "unsaved-changes",
		).toBe(true);
	});
});
