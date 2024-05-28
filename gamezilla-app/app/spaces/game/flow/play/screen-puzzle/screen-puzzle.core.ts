import { Flow, FlowVariantUIPlay } from "../../@/flow";
import type { FlowPack } from "../../@/flow-pack";
import type { FlowPuzzle } from "../../@/flow-puzzle";
import type { CoreModule } from "../play.types";
import type { ModelCore } from "./screen-puzzle.types";

const updateCoreMain: CoreModule["updateCore"] = ({ modelCore, msgCore }) => {
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

const watchPuzzleComplete = (input: {
	before: ModelCore;
	after: ModelCore;
}): ModelCore => {
	const flowPrev = FlowVariantUIPlay.deriveFlow({
		flow: input.before.flowPuzzle.flow,
		model: input.before.flowPlay,
	});

	const flowNew = FlowVariantUIPlay.deriveFlow({
		flow: input.after.flowPuzzle.flow,
		model: input.after.flowPlay,
	});

	const wasSolved = Flow.isSolved(flowPrev);
	const isSolved = Flow.isSolved(flowNew);

	if (!wasSolved && isSolved) {
		return {
			...input.after,
			opened: "puzzle-complete",
			state: {
				t: "solved",
			},
		};
	}

	if (isSolved) {
		return {
			...input.after,
			state: {
				t: "solved",
			},
		};
	}

	return {
		...input.after,
		state: {
			t: "solving",
		},
	};
};

const updateCore: CoreModule["updateCore"] = (input) => {
	const updated = updateCoreMain(input);
	if (
		input.modelCore.screen.t === "screen-puzzle" &&
		updated.screen.t === "screen-puzzle"
	) {
		const modelNew = watchPuzzleComplete({
			before: input.modelCore.screen,
			after: updated.screen,
		});
		return {
			...updated,
			screen: modelNew,
		};
	}
	return updated;
};

export const ScreenPuzzleCore = {
	updateCore,
	initCore,
};
