import type { UpdateCore } from "../../create.core";

const updateCore: UpdateCore = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		default: {
			return modelCore;
		}
	}
};

export const PackCreateGame = {
	updateCore,
};
