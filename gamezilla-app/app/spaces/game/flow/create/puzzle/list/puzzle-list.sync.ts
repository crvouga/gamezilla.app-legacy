import { FlowVariantUIEdit, FlowVariantUIPlay } from "../../../@/flow";
import type { UpdateCore } from "../../create.core";

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
					edit: FlowVariantUIEdit.init({
						flow: msgCore.puzzle.flow,
					}),
					play: FlowVariantUIPlay.init({
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
