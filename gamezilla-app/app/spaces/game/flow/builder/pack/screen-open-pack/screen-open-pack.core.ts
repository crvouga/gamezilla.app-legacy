import type { UpdateCore } from "../../builder.types";
import { PackBuilderCore } from "../screen-pack-builder/pack-builder.core";

const update: UpdateCore = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-list.user-clicked-pack-item": {
			return {
				...modelCore,
				opened: {
					t: "pack-builder",
				},
				packBuilder: PackBuilderCore.init({
					pack: msgCore.pack,
				}),
			};
		}

		default: {
			return modelCore;
		}
	}
};

export const PackListCore = {
	update,
};
