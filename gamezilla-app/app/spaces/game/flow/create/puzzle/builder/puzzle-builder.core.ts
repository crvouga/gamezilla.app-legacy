import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import { FlowVariantUIEdit, FlowVariantUIPlay } from "../../../@/flow";
import type { ModelCore, MsgCore } from "../../create.types";

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

			const currentFlow = FlowVariantUIEdit.toCurrentFlow({
				model: modelCore.puzzleBuilder.edit,
			});

			const updated = FlowVariantUIPlay.update({
				model: modelCore.puzzleBuilder.play,
				msg: msgCore.c,
				flow: currentFlow,
			});

			return {
				...modelCore,
				puzzleBuilder: {
					...modelCore.puzzleBuilder,
					play: updated,
				},
			};
		}

		case "puzzle-builder.flow-ui-edit": {
			if (!modelCore.puzzleBuilder) {
				return modelCore;
			}

			const updated = FlowVariantUIEdit.update({
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
			const initial = FlowVariantUIPlay.init({
				flow: FlowVariantUIEdit.toCurrentFlow({
					model: modelCore.puzzleBuilder.edit,
				}),
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
