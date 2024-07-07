import { FlowVarianEdit, FlowVariantPlay } from "../../@/flow";
import type { UpdateCore } from "../builder.types";
import { CreateNewPuzzleCore } from "./create-new/create-new-puzzle.core";

const updateCoreMain: UpdateCore = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "puzzle-list.clicked-puzzle-list-item": {
			return {
				...modelCore,
				listTab: "puzzles",
				packBuilder: modelCore.packBuilder,
				opened: { t: "puzzle-builder" },
				puzzleBuilder: {
					t: "puzzle-builder",
					edit: FlowVarianEdit.init({
						flow: msgCore.puzzle.flow,
					}),
					play: FlowVariantPlay.init({
						flowPuzzle: msgCore.puzzle,
					}),
					mode: { t: "edit" },
					puzzle: msgCore.puzzle,
				},
			};
		}

		default: {
			return modelCore;
		}
	}
};

const updateCore: UpdateCore = (input) => {
	return [CreateNewPuzzleCore.updateCore, updateCoreMain].reduce(
		(acc, updateCore) => updateCore({ ...input, modelCore: acc }),
		input.modelCore,
	);
};

export const ScreenOpenPuzzleCore = { updateCore };
