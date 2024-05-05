import type { UpdateCore } from "../../create.core";

const updateCore: UpdateCore = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "user-deleted-puzzle": {
			return {
				...modelCore,
				puzzleBuilder: null,
				opened: { t: "list" },
				listTab: "puzzles",
			};
		}
		default: {
			return modelCore;
		}
	}
};

export const PuzzleDeleteForeverCore = {
	updateCore,
};
