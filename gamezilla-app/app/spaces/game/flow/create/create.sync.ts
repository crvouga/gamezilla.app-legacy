import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import type { ModelCore, UpdateCore } from "./create.core";
import { ListTabsCore } from "./list-tabs/list-tabs.core";
import { PackCore } from "./pack/pack.sync";
import { PuzzleBuilderCore } from "./puzzle/builder/puzzle-builder.sync";
import { PuzzleCreateCore } from "./puzzle/create/puzzle-create.sync";
import { PuzzleDeleteForeverCore } from "./puzzle/delete-forever/puzzle-delete-forever.sync";
import { PuzzleEditCore } from "./puzzle/edit/puzzle-edit.sync";
import { PuzzleListCore } from "./puzzle/list/puzzle-list.sync";
import { PuzzleSaveChangesCore } from "./puzzle/save-changes/puzzle-save-changes.sync";

const initCore = (_input: { ctx: SpaceCtx }): ModelCore => {
	return {
		...ListTabsCore.initCore,
		...PackCore.initCore,
		opened: { t: "list" },
		packBuilder: null,
		puzzleBuilder: null,
	};
};

const updateCore: UpdateCore = (input) => {
	return [
		PuzzleDeleteForeverCore.updateCore,
		PuzzleBuilderCore.updateCore,
		PuzzleCreateCore.updateCore,
		PuzzleListCore.updateCore,
		PuzzleEditCore.updateCore,
		PuzzleSaveChangesCore.updateCore,
		//
		PackCore.updateCore,
		//
		ListTabsCore.updateCore,
	].reduce(
		(acc, updateCore) => updateCore({ ...input, modelCore: acc }),
		input.modelCore,
	);
};

export const CreateCore = {
	initCore,
	updateCore,
};
