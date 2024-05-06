import type { UpdateCore } from "../../builder.types";

const update: UpdateCore = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		default: {
			return modelCore;
		}
	}
};

export const PackCreateNewCore = {
	update,
};
