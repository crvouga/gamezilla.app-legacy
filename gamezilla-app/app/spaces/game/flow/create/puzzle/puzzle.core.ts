import type { UpdateCore } from "../create.types";
import { PuzzleBuilderCore } from "./builder/puzzle-builder.core";
import { PuzzleCreateCore } from "./create/puzzle-create.core";
import { PuzzleDeleteForeverCore } from "./delete-forever/puzzle-delete-forever.core";
import { PuzzleEditCore } from "./edit/puzzle-edit.core";
import { PuzzleListCore } from "./list/puzzle-list.core";
import { PuzzleSaveChangesCore } from "./save-changes/puzzle-save-changes.core";

const updateCore: UpdateCore = (input) => {
	return [
		PuzzleDeleteForeverCore.updateCore,
		PuzzleBuilderCore.updateCore,
		PuzzleCreateCore.updateCore,
		PuzzleListCore.updateCore,
		PuzzleEditCore.updateCore,
		PuzzleSaveChangesCore.updateCore,
	].reduce(
		(acc, updateCore) => updateCore({ ...input, modelCore: acc }),
		input.modelCore,
	);
};

export const PuzzleCore = {
	updateCore,
};
