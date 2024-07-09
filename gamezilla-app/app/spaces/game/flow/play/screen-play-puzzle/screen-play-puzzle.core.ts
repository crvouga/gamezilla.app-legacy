import { Flow } from "../../@/flow";
import type { FlowPack } from "../../@/flow-pack";
import type { FlowPuzzle } from "../../@/flow-puzzle";
import { FlowPlay } from "../../@/flow/flow-play";
import type { CoreModule, MsgCore } from "../play.types";
import * as CopyPuzzleCore from "./copy-puzzle/copy-puzzle.core";
import { LastPuzzleCore } from "./last-puzzle/last-puzzle.core";
import type { ModelCore } from "./screen-play-puzzle.types";

const updatePuzzleScreen: CoreModule["updateCore"] = (input) => {
	switch (input.modelCore.screen.t) {
		case "screen-play-puzzle": {
			const screenPuzzle = updateScreen(input.modelCore.screen, input.msgCore);
			return {
				...input.modelCore,
				screen: screenPuzzle,
			};
		}
		default: {
			return input.modelCore;
		}
	}
};

const updateScreen = (modelCore: ModelCore, msgCore: MsgCore): ModelCore => {
	switch (msgCore.t) {
		case "flow-variant-play": {
			const flowPlayNew = FlowPlay.update({
				msg: msgCore.c,
				model: modelCore.flowPlay,
				flowPuzzle: modelCore.flowPuzzle,
			});

			if (flowPlayNew.event?.t === "solved") {
				return {
					...modelCore,
					flowPlay: flowPlayNew.model,
					opened: "puzzle-complete",
				};
			}

			return {
				...modelCore,
				flowPlay: flowPlayNew.model,
			};
		}
		case "user-closed-puzzle-complete-dialog": {
			if (
				toStatus(modelCore) === "solved" &&
				modelCore.opened === "puzzle-complete"
			) {
				return {
					...modelCore,
					opened: null,
				};
			}

			return modelCore;
		}

		case "user-clicked-next-puzzle": {
			return {
				...modelCore,
				flowPlay: FlowPlay.init({ flowPuzzle: msgCore.nextPuzzle }),
				opened:
					modelCore.opened === "puzzle-complete" ? null : modelCore.opened,
				flowPuzzle: msgCore.nextPuzzle,
				puzzleIndex: msgCore.nextPuzzleIndex,
			};
		}

		case "user-clicked-prev-puzzle": {
			return {
				...modelCore,
				flowPlay: FlowPlay.init({
					flowPuzzle: msgCore.prevPuzzle,
				}),
				opened:
					modelCore.opened === "puzzle-complete" ? null : modelCore.opened,
				flowPuzzle: msgCore.prevPuzzle,
				puzzleIndex: msgCore.prevPuzzleIndex,
			};
		}

		case "user-clicked-reset-puzzle": {
			return {
				...modelCore,
				flowPlay: FlowPlay.init({
					flowPuzzle: modelCore.flowPuzzle,
				}),
			};
		}

		case "user-toggled-action-buttons-drawer": {
			return {
				...modelCore,
				opened: modelCore.opened === "action-drawer" ? null : "action-drawer",
			};
		}

		default: {
			return modelCore;
		}
	}
};

const updateCoreMain: CoreModule["updateCore"] = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "user-clicked-exit-puzzle": {
			switch (modelCore.screen.t) {
				case "screen-play-puzzle": {
					return {
						...modelCore,
						screen: {
							t: "screen-select-puzzle",
							flowPack: modelCore.screen.flowPack,
						},
					};
				}
				default: {
					return modelCore;
				}
			}
		}
		default: {
			return modelCore;
		}
	}
};

const initCore = (input: {
	flowPack: FlowPack;
	flowPuzzle: FlowPuzzle;
	puzzleIndex: number;
}): ModelCore => {
	return {
		...input,
		flowPlay: FlowPlay.init({ flowPuzzle: input.flowPuzzle }),
		opened: null,
		t: "screen-play-puzzle",
		hints: {},
	};
};

const updates = [
	updatePuzzleScreen,
	updateCoreMain,
	LastPuzzleCore.updateCore,
	CopyPuzzleCore.updateCore,
	//
];
const updateCore: CoreModule["updateCore"] = (input) => {
	return updates.reduce(
		(acc, update) => update({ ...input, modelCore: acc }),
		input.modelCore,
	);
};

const toStatus = (modelCore: ModelCore): "solved" | "solving" => {
	const flow = FlowPlay.toFlow({
		flow: modelCore.flowPuzzle.flow,
		model: modelCore.flowPlay,
	});
	if (Flow.isSolved(flow)) {
		return "solved";
	}
	return "solving";
};

export const ScreenPlayPuzzleCore = {
	updateCore,
	initCore,
	updateScreen,
	toStatus,
};
