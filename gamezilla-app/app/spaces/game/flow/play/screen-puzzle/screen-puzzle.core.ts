import { FlowVariantUIPlay } from "../../@/flow";
import type { FlowPack } from "../../@/flow-pack";
import type { FlowPuzzle } from "../../@/flow-puzzle";
import type { CoreModule } from "../play.types";
import type { ModelCore } from "./screen-puzzle.types";

const updateCore: CoreModule["updateCore"] = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "user-clicked-exit-puzzle-button": {
			switch (modelCore.screen.t) {
				case "screen-puzzle": {
					return {
						...modelCore,
						screen: {
							t: "screen-pack",
							flowPack: modelCore.screen.flowPack,
						},
					};
				}
				default: {
					return modelCore;
				}
			}
		}
		case "got-puzzle-screen-flow-play-msg": {
			switch (modelCore.screen.t) {
				case "screen-puzzle": {
					const flowPlayNew = FlowVariantUIPlay.update({
						msg: msgCore.c,
						model: modelCore.screen.flowPlay,
						flow: modelCore.screen.flowPuzzle.flow,
					});

					if (flowPlayNew.event?.t === "solved") {
						return {
							...modelCore,
							screen: {
								...modelCore.screen,
								flowPlay: flowPlayNew.model,
								opened: "puzzle-complete",
								state: {
									t: "solved",
								},
							},
						};
					}

					return {
						...modelCore,
						screen: {
							...modelCore.screen,
							flowPlay: flowPlayNew.model,
							state: {
								t: "solving",
							},
						},
					};
				}
				default: {
					return modelCore;
				}
			}
		}
		case "user-closed-puzzle-complete-dialog": {
			if (
				modelCore.screen.t === "screen-puzzle" &&
				modelCore.screen.state.t === "solved" &&
				modelCore.screen.opened === "puzzle-complete"
			) {
				return {
					...modelCore,
					screen: {
						...modelCore.screen,
						opened: null,
					},
				};
			}

			return modelCore;
		}
		case "user-clicked-next-puzzle-button": {
			switch (modelCore.screen.t) {
				case "screen-puzzle": {
					return {
						...modelCore,
						screen: {
							...modelCore.screen,
							flowPlay: FlowVariantUIPlay.init({
								flow: msgCore.nextPuzzle.flow,
							}),
							flowPuzzle: msgCore.nextPuzzle,
							puzzleIndex: msgCore.nextPuzzleIndex,
						},
					};
				}
				default: {
					return modelCore;
				}
			}
		}
		case "user-clicked-prev-puzzle-button": {
			switch (modelCore.screen.t) {
				case "screen-puzzle": {
					return {
						...modelCore,
						screen: {
							...modelCore.screen,
							flowPlay: FlowVariantUIPlay.init({
								flow: msgCore.prevPuzzle.flow,
							}),
							flowPuzzle: msgCore.prevPuzzle,
							puzzleIndex: msgCore.prevPuzzleIndex,
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
		t: "screen-puzzle",
	};
};


export const ScreenPuzzleCore = {
	updateCore,
	initCore,
};
