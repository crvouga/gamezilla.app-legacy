import { FlowVariantUIEdit, FlowVariantUIPlay } from "../../../@/flow";
import type { SyncReducer } from "../../create.core";

const reducer: SyncReducer = ({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "puzzle-list.clicked-puzzle-list-item": {
			return {
				...modelSync,
				listTab: "puzzles",
				packBuilder: modelSync.packBuilder,
				opened: { t: "puzzle-builder" },
				puzzleBuilder: {
					t: "puzzle-builder",
					edit: FlowVariantUIEdit.init({
						flow: msgSync.puzzle.flow,
					}),
					play: FlowVariantUIPlay.init({
						flow: msgSync.puzzle.flow,
					}),
					mode: { t: "edit" },
					puzzle: msgSync.puzzle,
				},
			};
		}

		default: {
			return modelSync;
		}
	}
};

export const PuzzleListGame = { reducer };
