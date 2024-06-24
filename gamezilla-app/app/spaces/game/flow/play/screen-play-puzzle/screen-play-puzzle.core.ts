import { Flow, FlowVariantUIPlay } from "../../@/flow";
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
			const screenPuzzle = updateChild(input.modelCore.screen, input.msgCore);
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

const updateChild = (modelCore: ModelCore, msgCore: MsgCore): ModelCore => {
	switch (msgCore.t) {
		case "got-puzzle-screen-flow-play-msg": {
			const flowPlayNew = FlowVariantUIPlay.update({
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
				modelCore.t === "screen-play-puzzle" &&
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

		case "user-clicked-next-puzzle-button": {
			return {
				...modelCore,
				flowPlay: FlowVariantUIPlay.init({
					flow: msgCore.nextPuzzle.flow,
				}),
				opened:
					modelCore.opened === "puzzle-complete" ? null : modelCore.opened,
				flowPuzzle: msgCore.nextPuzzle,
				puzzleIndex: msgCore.nextPuzzleIndex,
			};
		}

		case "user-clicked-prev-puzzle-button": {
			return {
				...modelCore,
				flowPlay: FlowVariantUIPlay.init({
					flow: msgCore.prevPuzzle.flow,
				}),
				opened:
					modelCore.opened === "puzzle-complete" ? null : modelCore.opened,
				flowPuzzle: msgCore.prevPuzzle,
				puzzleIndex: msgCore.prevPuzzleIndex,
			};
		}

		case "user-clicked-reset-puzzle-button": {
			return {
				...modelCore,
				flowPlay: FlowVariantUIPlay.init({
					flow: modelCore.flowPuzzle.flow,
				}),
				state: {
					t: "solving",
				},
			};
		}

		case "user-clicked-hint-button": {
			const nextHintGroupId = toNextHintGroupId(modelCore.flowPuzzle.flow);
			if (!nextHintGroupId) {
				return modelCore;
			}
			return {
				...modelCore,
				hints: {
					...modelCore.hints,
					[nextHintGroupId]: nextHintGroupId,
				},
			};
		}

		default: {
			return modelCore;
		}
	}
};

const updateCoreMain: CoreModule["updateCore"] = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "user-clicked-exit-puzzle-button": {
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
		flowPlay: FlowVariantUIPlay.init({
			flow: input.flowPuzzle.flow,
		}),
		state: {
			t: "solving",
		},
		opened: null,
		t: "screen-play-puzzle",
		hints: {},
	};
};

const toNextHintGroupId = (model: Flow.Model): Flow.GroupId | null => {
	for (const groupId of Flow.GROUP_ID_ORDER) {
		if (!Flow.isTerminalConnectedWithPipes(model, groupId)) {
			return groupId;
		}
	}
	return null;
};

const isAnyShowingHint = (modelCore: ModelCore): boolean => {
	return Object.keys(modelCore.hints).length > 0;
};

export const ScreenPuzzleCore = {
	updateCore,
	isAnyShowingHint,
	initCore,
};
