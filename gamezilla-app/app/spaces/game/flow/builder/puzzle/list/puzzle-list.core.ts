import { FlowVarianEdit, FlowVariantPlay } from "../../../@/flow";
import type { UpdateCore } from "../../builder.types";

const updateCore: UpdateCore = ({ modelCore, msgCore }) => {
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
						flow: msgCore.puzzle.flow,
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

export const PuzzleListCore = { updateCore };
