import { FlowVariantPlay } from "../../@/flow";
import type { FlowPack } from "../../@/flow-pack";
import type { FlowPuzzle } from "../../@/flow-puzzle";
import type { CoreModule, MsgCore } from "../play.types";
import { LastPuzzleCore } from "./last-puzzle/last-puzzle.core";
import type { ModelCore } from "./screen-play-puzzle.types";

const updateCore: CoreModule["updateCore"] = (input) => {
	return [
		updatePuzzleScreen,
		updateCoreMain,
		LastPuzzleCore.updateCore,
		//
	].reduce(
		(acc, update) => update({ ...input, modelCore: acc }),
		input.modelCore,
	);
};

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
			const flowPlayNew = FlowVariantPlay.update({
				msg: msgCore.c,
				model: modelCore.flowPlay,
				flow: modelCore.flowPuzzle.flow,
			});

			if (flowPlayNew.event?.t === "solved") {
				return {
					...modelCore,
					flowPlay: flowPlayNew.model,
					opened: "puzzle-complete",
					state: {
						t: "solved",
					},
				};
			}

			return {
				...modelCore,
				flowPlay: flowPlayNew.model,
				state: {
					t: "solving",
				},
			};
		}
		case "user-closed-puzzle-complete-dialog": {
			if (
				modelCore.state.t === "solved" &&
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
				flowPlay: FlowVariantPlay.init({
					flow: msgCore.nextPuzzle.flow,
				}),
				opened:
					modelCore.opened === "puzzle-complete" ? null : modelCore.opened,
				flowPuzzle: msgCore.nextPuzzle,
				puzzleIndex: msgCore.nextPuzzleIndex,
				state:
					modelCore.state.t === "solved" ? { t: "solving" } : modelCore.state,
			};
		}

		case "user-clicked-prev-puzzle": {
			return {
				...modelCore,
				flowPlay: FlowVariantPlay.init({
					flow: msgCore.prevPuzzle.flow,
				}),
				opened:
					modelCore.opened === "puzzle-complete" ? null : modelCore.opened,
				flowPuzzle: msgCore.prevPuzzle,
				puzzleIndex: msgCore.prevPuzzleIndex,
				state:
					modelCore.state.t === "solved" ? { t: "solving" } : modelCore.state,
			};
		}

		case "user-clicked-reset-puzzle": {
			return {
				...modelCore,
				flowPlay: FlowVariantPlay.init({
					flow: modelCore.flowPuzzle.flow,
				}),
				state: {
					t: "solving",
				},
			};
		}
			
		case 'user-toggled-action-buttons-drawer': {
			return {
				...modelCore,
				opened: modelCore.opened === "action-drawer" ? null : "action-drawer",
			}
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
		flowPlay: FlowVariantPlay.init(input.flowPuzzle),
		state: {
			t: "solving",
		},
		opened: null,
		t: "screen-play-puzzle",
		hints: {},
	};
};

export const ScreenPuzzleCore = {
	updateCore,
	initCore,
	updateScreen,
};
