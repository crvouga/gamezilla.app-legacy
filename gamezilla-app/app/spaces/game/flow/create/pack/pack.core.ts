import type { UpdateCore } from "../create.types";
import { PackBuilderCore } from "./builder/pack-builder.core";
import { PackCreateGame } from "./create/pack-create.core";
import { PackListGame } from "./list/pack-list.core";
import type { ModelCore } from "./pack.types";
import { RemovePuzzleGame } from "./remove-puzzle/remove-puzzle.core";

const initCore: ModelCore = {
	...RemovePuzzleGame.initCore,
	packBuilder: null,
};

const updateCore: UpdateCore = (input) => {
	return [
		PackCreateGame.updateCore,
		PackBuilderCore.updateCore,
		PackListGame.updateCore,
	].reduce(
		(modelCore, updateCore) => updateCore({ ...input, modelCore }),
		input.modelCore,
	);
};

export const PackCore = {
	initCore,
	updateCore,
};
