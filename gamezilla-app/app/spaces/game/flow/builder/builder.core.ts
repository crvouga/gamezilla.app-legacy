import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import type { ModelCore, UpdateCore } from "./builder.types";
import { ListTabsCore } from "./list-tabs/list-tabs.core";
import { PackCore } from "./pack/pack.core";
import { ScreenOpenPuzzleCore } from "./screen-open-puzzle/screen-open-puzzle.core";
import { ScreenPuzzleBuilderCore } from "./screen-puzzle-builder/screen-puzzle-builder.core";

const initCore = (_input: { ctx: SpaceCtx }): ModelCore => {
	return {
		...ListTabsCore.initCore,
		...PackCore.initCore,
		opened: { t: "list" },
		packBuilder: null,
		openPuzzle: null,
		puzzleBuilder: null,
	};
};

const updates: UpdateCore[] = [
	ScreenPuzzleBuilderCore.updateCore,
	ScreenOpenPuzzleCore.updateCore,
	PackCore.updateCore,
	ListTabsCore.updateCore,
];

const updateCore: UpdateCore = (input) => {
	return updates.reduce(
		(acc, updateCore) => updateCore({ ...input, modelCore: acc }),
		input.modelCore,
	);
};

export const BuilderCore = {
	initCore,
	updateCore,
};
