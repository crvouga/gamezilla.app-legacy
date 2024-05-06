import type { UpdateCore } from "../create.types";
import { PackCreateGame } from "./create/pack-create.core";
import { PackListGame } from "./list/pack-list.core";
import { PackBuilderCore } from "./pack-builder/pack-builder.core";
import type { ModelCore } from "./pack.types";

const initCore: ModelCore = {
	packBuilder: null,
};

const updateCore: UpdateCore = (input) => {
	return [
		PackCreateGame.updateCore,
		PackBuilderCore.update,
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
