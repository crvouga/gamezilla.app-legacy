import type { UpdateCore } from "../builder.types";
import { PackCreateNewCore } from "./pack-create-new/pack-create-new.core";
import { PackListCore } from "./pack-list/pack-list.core";
import { PackBuilderCore } from "./pack-builder/pack-builder.core";
import type { ModelCore } from "./pack.types";

const initCore: ModelCore = {
	packBuilder: null,
};

const updateCore: UpdateCore = (input) => {
	return [
		PackCreateNewCore.update,
		PackBuilderCore.update,
		PackListCore.update,
	].reduce(
		(modelCore, updateCore) => updateCore({ ...input, modelCore }),
		input.modelCore,
	);
};

export const PackCore = {
	initCore,
	updateCore,
};
