import type { UpdateCore } from "../../create.types";

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
					slideIndex: 0,
					opened: {
						t: null,
					},
					screen: {
						t: "screen-puzzle-grid",
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
