import { RequestResponse } from "gamezilla-app/@shared/core";
import type { ModelSync, MsgSync } from "./remove-puzzle.core";

const initSync: ModelSync = {
	removePuzzleRequest: RequestResponse.notAsked,
};

const reducer = (modelSync: ModelSync, msgSync: MsgSync): ModelSync => {
	switch (msgSync.t) {
		case "remove-puzzle.user-removed-puzzle-from-pack": {
			return {
				...modelSync,
				removePuzzleRequest: RequestResponse.response(
					modelSync.removePuzzleRequest,
					msgSync.now,
					msgSync.result,
				),
			};
		}

		default: {
			return modelSync;
		}
	}
};

export const RemovePuzzleGame = {
	initSync,
	reducer,
};
