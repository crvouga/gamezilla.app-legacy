import type { UpdateCore } from "../create.types";
import type { ModelCore } from "./list-tabs.types";

const initCore: ModelCore = {
	listTab: "puzzles",
};

const updateCore: UpdateCore = (input) => {
	switch (input.msgCore.t) {
		case "user-changed-list-tab": {
			return {
				...input.modelCore,
				listTab: input.msgCore.listTab,
			};
		}

		default: {
			return input.modelCore;
		}
	}
};

export const ListTabsCore = {
	initCore,
	updateCore,
};
