import type { UpdateCore } from "../../create.core";

const updateCore: UpdateCore = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-list.user-clicked-pack-item": {
			return {
				...modelCore,
				opened: {
					t: "pack-builder",
				},
				packBuilder: {
					t: "pack-builder",
					pack: msgCore.pack,
					opened: {
						t: null,
					},
					screen: {
						t: "screen-puzzle-grid",
						pageIndex: 0,
					},
				},
			};
		}

		default: {
			return modelCore;
		}
	}
};

export const PackListGame = {
	updateCore,
};
