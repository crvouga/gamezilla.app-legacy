import type { UpdateCore } from "../../builder.types";

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

export const DeleteForeverCore = {
	updateCore,
};
