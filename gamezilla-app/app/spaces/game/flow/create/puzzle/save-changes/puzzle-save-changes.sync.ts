import { isErr } from "gamezilla-app/@/core";
import type { UpdateCore } from "../../create.core";

const updateCore: UpdateCore = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "puzzle-builder.saved-puzzle": {
			if (isErr(msgCore.saved)) {
				return modelCore;
			}

			if (!modelCore.puzzleBuilder) {
				return modelCore;
			}

			return {
				...modelCore,
				listTab: modelCore.listTab,
				opened: modelCore.opened,
				packBuilder: modelCore.packBuilder,
				puzzleBuilder: {
					...modelCore.puzzleBuilder,
					puzzle: msgCore.saved.value,
				},
			};
		}

		default: {
			return modelCore;
		}
	}
};

export const PuzzleSaveChangesCore = {
	updateCore,
};
