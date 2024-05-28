import { Flow, FlowVariantUIPlay } from "../../@/flow";
import { FlowPack } from "../../@/flow-pack";
import { FlowPuzzle } from "../../@/flow-puzzle";
import { CoreModule } from "../play.types";
import { ModelCore } from "./screen-puzzle.types";

export const updateCore: CoreModule["updateCore"] = ({
	modelCore,
	msgCore,
}) => {
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
					const flow = modelCore.screen.flowPuzzle.flow;
					
					const flowPlayNew = FlowVariantUIPlay.update({
						msg: msgCore.c,
						model: modelCore.screen.flowPlay,
						flow,
					});

					const flowNew = FlowVariantUIPlay.deriveFlow({
						flow,
						model: flowPlayNew,
					});

					if (Flow.isSolved(flowNew)) {
						return {
							...modelCore,
							screen: {
								...modelCore.screen,
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
							flowPlay: flowPlayNew,
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
		t: "screen-puzzle",
	};
};

export const ScreenPuzzleCore = {
	updateCore,
	initCore,
};
