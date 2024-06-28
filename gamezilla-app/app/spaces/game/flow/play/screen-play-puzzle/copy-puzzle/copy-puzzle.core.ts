import type { CoreModule } from "../../play.types";

export const updateCore: CoreModule["updateCore"] = (input) => {
	switch (input.msgCore.t) {
		case "user-clicked-copy-to-clipboard": {
			return {
				...input.modelCore,
				screen: {
					...input.modelCore.screen,
					opened: null,
				},
			};
		}
		default: {
			return input.modelCore;
		}
	}
};
