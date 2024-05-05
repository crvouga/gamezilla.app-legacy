import type { UpdateCore } from "../create.core";
import { PackBuilderCore } from "./builder/pack-builder.sync";
import { PackCreateGame } from "./create/pack-create.sync";
import { PackListGame } from "./list/pack-list.sync";
import type { ModelCore } from "./pack.core";
import { RemovePuzzleGame } from "./remove-puzzle/remove-puzzle.sync";

const initCore: ModelCore = {
	...RemovePuzzleGame.initCore,
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
