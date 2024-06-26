import { FlowVariantPlay } from "../@/flow";
import { samples } from "../@/flow/flow-variant/flow-grid/flow-grid-samples";
import type { CoreModule } from "./play.types";
import { ScreenPuzzleCore } from "./screen-play-puzzle/screen-play-puzzle.core";

const initCore: CoreModule["initCore"] = () => {
	const flow = samples["8x8"][1];
	return {
		play: FlowVariantPlay.init({
			flow,
		}),
		flow,
		screen: {
			t: "screen-select-pack",
		},
	};
};

const update: CoreModule["updateCore"] = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "user-clicked-open-pack-list-item": {
			return {
				...modelCore,
				screen: {
					t: "screen-select-puzzle",
					flowPack: msgCore.pack,
				},
			};
		}
		case "user-clicked-exit-pack-button": {
			return {
				...modelCore,
				screen: {
					t: "screen-select-pack",
				},
			};
		}
		case "user-clicked-open-puzzle-grid-item": {
			switch (modelCore.screen.t) {
				case "screen-select-puzzle": {
					return {
						...modelCore,
						screen: ScreenPuzzleCore.initCore({
							flowPack: modelCore.screen.flowPack,
							puzzleIndex: msgCore.puzzleIndex,
							flowPuzzle: msgCore.flowPuzzle,
						}),
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

const updates = [update, ScreenPuzzleCore.updateCore];
const updateCore: CoreModule["updateCore"] = ({ modelCore, msgCore, ctx }) => {
	return updates.reduce(
		(acc, update) => update({ modelCore: acc, msgCore, ctx }),
		modelCore,
	);
};

export const PlayCore = {
	initCore,
	updateCore,
};
