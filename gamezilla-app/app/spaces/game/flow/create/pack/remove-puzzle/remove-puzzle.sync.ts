import { RequestResponse } from "gamezilla-app/@/core";
import type { ModelCore, MsgCore } from "./remove-puzzle.core";

const initCore: ModelCore = {
	removePuzzleRequest: RequestResponse.notAsked,
};

const updateCore = (modelCore: ModelCore, msgCore: MsgCore): ModelCore => {
	switch (msgCore.t) {
		case "remove-puzzle.user-removed-puzzle-from-pack": {
			return {
				...modelCore,
				removePuzzleRequest: RequestResponse.response(
					modelCore.removePuzzleRequest,
					msgCore.now,
					msgCore.result,
				),
			};
		}

		default: {
			return modelCore;
		}
	}
};

export const RemovePuzzleGame = {
	initCore,
	updateCore,
};
