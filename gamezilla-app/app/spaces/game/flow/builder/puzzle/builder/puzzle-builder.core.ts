import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import { FlowVarianEdit, FlowVariantPlay } from "../../../@/flow";
import type { ModelCore, MsgCore } from "../../builder.types";

const updateCore = ({
	modelCore,
	msgCore,
	ctx,
}: {
	ctx: SpaceCtx;
	msgCore: MsgCore;
	modelCore: ModelCore;
}): ModelCore => {
	switch (msgCore.t) {
		case "puzzle-builder.flow-ui-play": {
			if (!modelCore.puzzleBuilder) {
				return modelCore;
			}

			const flow = FlowVarianEdit.deriveFlowMemoized({
				model: modelCore.puzzleBuilder.edit,
			});

			const updated = FlowVariantPlay.update({
				model: modelCore.puzzleBuilder.play,
				msg: msgCore.c,
				flowPuzzle: { ...modelCore.puzzleBuilder.puzzle, flow: flow },
			});

			return {
				...modelCore,
				puzzleBuilder: {
					...modelCore.puzzleBuilder,
					play: updated.model,
				},
			};
		}

		case "puzzle-builder.flow-ui-edit": {
			if (!modelCore.puzzleBuilder) {
				return modelCore;
			}

			const updated = FlowVarianEdit.update({
				model: modelCore.puzzleBuilder.edit,
				msg: msgCore.c,
				flow: modelCore.puzzleBuilder.puzzle.flow,
			});

			return {
				...modelCore,
				puzzleBuilder: {
					...modelCore.puzzleBuilder,
					edit: updated.model,
				},
			};
		}

		case "puzzle-builder.user-clicked-edit-mode-button": {
			if (!modelCore.puzzleBuilder) {
				return modelCore;
			}

			if (msgCore.userId !== ctx.space.hostId) {
				return modelCore;
			}

			return {
				...modelCore,
				puzzleBuilder: {
					...modelCore.puzzleBuilder,
					mode: { t: "edit" },
				},
			};
		}

		case "puzzle-builder.user-clicked-play-mode-button": {
			if (!modelCore.puzzleBuilder) {
				return modelCore;
			}
			const initial = FlowVariantPlay.init({
				flowPuzzle: {
					...modelCore.puzzleBuilder.puzzle,
					flow: FlowVarianEdit.deriveFlowMemoized({
						model: modelCore.puzzleBuilder.edit,
					}),
				},
			});
			return {
				...modelCore,
				puzzleBuilder: {
					...modelCore.puzzleBuilder,
					mode: { t: "play" },
					play: initial,
				},
			};
		}

		case "puzzle-builder.user-clicked-exit-button": {
			if (msgCore.userId !== ctx.space.hostId) {
				return modelCore;
			}

			return { ...modelCore, opened: { t: "list" }, listTab: "puzzles" };
		}

		default: {
			return modelCore;
		}
	}
};

export const PuzzleBuilderCore = {
	updateCore,
};
