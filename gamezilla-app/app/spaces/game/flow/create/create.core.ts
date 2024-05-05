import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import type { ModelCore, UpdateCore } from "./create.types";
import { ListTabsCore } from "./list-tabs/list-tabs.core";
import { PackCore } from "./pack/pack.core";
import { PuzzleCore } from "./puzzle/puzzle.core";

const initCore = (_input: { ctx: SpaceCtx }): ModelCore => {
	return {
		...ListTabsCore.initCore,
		...PackCore.initCore,
		opened: { t: "list" },
		packBuilder: null,
		puzzleBuilder: null,
	};
};

const updates: UpdateCore[] = [
	PuzzleCore.updateCore,
	PackCore.updateCore,
	ListTabsCore.updateCore,
];

const updateCore: UpdateCore = (input) => {
	return updates.reduce(
		(acc, updateCore) => updateCore({ ...input, modelCore: acc }),
		input.modelCore,
	);
};

export const CreateCore = {
	initCore,
	updateCore,
};
