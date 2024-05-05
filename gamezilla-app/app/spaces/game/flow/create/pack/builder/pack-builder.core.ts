import { isErr } from "gamezilla-app/@/core";
import { FlowVariantUIPlay } from "../../../@/flow";
import { FlowPack } from "../../../@/flow-pack/flow-pack";
import { UpdateCore } from "../../create.types";
import { ModelCore } from "./pack-builder.types";
import { FlowPackGridUI } from "../../../@/flow-pack/flow-pack-grid/flow-pack-grid-ui";

const updateCores: UpdateCore[] = [];

updateCores.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "user-created-pack": {
			if (isErr(msgCore.created)) {
				return modelCore;
			}

			return {
				...modelCore,
				opened: { t: "pack-builder" },
				packBuilder: {
					t: "pack-builder",
					opened: { t: null },
					screen: {
						t: "screen-puzzle-grid",
						slideIndex: 0,
					},
					pack: msgCore.created.value,
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

updateCores.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.user-clicked-exit-button": {
			return {
				...modelCore,
				puzzleBuilder: modelCore.puzzleBuilder,
				packBuilder: modelCore.packBuilder,
				opened: { t: "list" },
				listTab: "packs",
			};
		}
		default: {
			return modelCore;
		}
	}
});

updateCores.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.user-clicked-add-puzzle-item": {
			if (!modelCore.packBuilder) {
				return modelCore;
			}
			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					pack: FlowPack.add(modelCore.packBuilder.pack, msgCore.puzzle.id),
					screen: {
						t: "screen-puzzle-grid",
						slideIndex: 0,
					},
					opened: {
						t: null,
					},
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

updateCores.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.user-clicked-open-add-puzzle-button": {
			if (!modelCore.packBuilder) {
				return modelCore;
			}
			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					screen: {
						t: "screen-add-puzzle",
					},
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

updateCores.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.user-closed-add-puzzle": {
			if (!modelCore.packBuilder) {
				return modelCore;
			}
			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					opened: {
						t: null,
					},
					screen: {
						t: "screen-puzzle-grid",
						slideIndex: 0,
					},
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

updateCores.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.user-clicked-pack-item": {
			if (!modelCore.packBuilder) {
				return modelCore;
			}

			const index = modelCore.packBuilder.pack.puzzleIds.indexOf(
				msgCore.puzzle.id,
			);

			if (index === -1) {
				return modelCore;
			}

			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					screen: {
						opened: null,
						t: "screen-puzzle",
						puzzleIndex: index,
						puzzle: msgCore.puzzle,
						playUI: FlowVariantUIPlay.init({
							flow: msgCore.puzzle.flow,
						}),
					},
				},
			};
		}

		default: {
			return modelCore;
		}
	}
});

updateCores.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.puzzle-screen.user-clicked-exit-puzzle-button": {
			if (!modelCore.packBuilder) {
				return modelCore;
			}

			const puzzleIndex =
				modelCore.packBuilder.screen.t === "screen-puzzle"
					? modelCore.packBuilder.screen.puzzleIndex
					: null;

			if (puzzleIndex === null) {
				return modelCore;
			}

			const slideIndex = FlowPackGridUI.toSlideIndex({
				index: puzzleIndex,
			});

			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					screen: {
						t: "screen-puzzle-grid",
						slideIndex: slideIndex,
					},
				},
			};
		}

		default: {
			return modelCore;
		}
	}
});

updateCores.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.flow-play-ui": {
			if (!modelCore.packBuilder) {
				return modelCore;
			}

			if (modelCore.packBuilder.screen.t !== "screen-puzzle") {
				return modelCore;
			}

			const screen = modelCore.packBuilder.screen;

			const updated = FlowVariantUIPlay.update({
				flow: screen.puzzle.flow,
				model: screen.playUI,
				msg: msgCore.c,
			});

			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					screen: {
						opened: null,
						t: "screen-puzzle",
						puzzleIndex: modelCore.packBuilder.screen.puzzleIndex,
						puzzle: modelCore.packBuilder.screen.puzzle,
						playUI: updated,
					},
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

updateCores.push(({ modelCore, msgCore }) => {
	if (modelCore.packBuilder?.screen.t !== "screen-puzzle") {
		return modelCore;
	}

	switch (msgCore.t) {
		case "pack-builder.puzzle-screen.user-clicked-next-puzzle-button": {
			const indexOfNextPuzzle = modelCore.packBuilder.pack.puzzleIds.indexOf(
				msgCore.nextPuzzle.id,
			);
			if (indexOfNextPuzzle === -1) {
				return modelCore;
			}
			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					screen: {
						t: "screen-puzzle",
						opened: null,
						puzzleIndex: clamp(
							modelCore.packBuilder.screen.puzzleIndex + 1,
							0,
							modelCore.packBuilder.pack.puzzleIds.length - 1,
						),
						playUI: FlowVariantUIPlay.init({
							flow: msgCore.nextPuzzle.flow,
						}),
						puzzle: msgCore.nextPuzzle,
					},
				},
			};
		}

		default: {
			return modelCore;
		}
	}
});

updateCores.push(({ modelCore, msgCore }) => {
	if (modelCore.packBuilder?.screen.t !== "screen-puzzle") {
		return modelCore;
	}

	switch (msgCore.t) {
		case "pack-builder.puzzle-screen.user-clicked-previous-puzzle-button": {
			const indexOfPreviousPuzzle =
				modelCore.packBuilder.pack.puzzleIds.indexOf(msgCore.previousPuzzle.id);
			if (indexOfPreviousPuzzle === -1) {
				return modelCore;
			}
			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					screen: {
						t: "screen-puzzle",
						opened: null,
						puzzleIndex: clamp(
							modelCore.packBuilder.screen.puzzleIndex - 1,
							0,
							modelCore.packBuilder.pack.puzzleIds.length - 1,
						),
						playUI: FlowVariantUIPlay.init({
							flow: msgCore.previousPuzzle.flow,
						}),
						puzzle: msgCore.previousPuzzle,
					},
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

updateCores.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.puzzle-screen.user-clicked-more-button": {
			if (!modelCore.packBuilder) {
				return modelCore;
			}
			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					screen: {
						...modelCore.packBuilder.screen,
						opened: "more",
					},
				},
			};
		}
		case "pack-builder.puzzle-screen.user-closed-more-drawer": {
			if (!modelCore.packBuilder) {
				return modelCore;
			}
			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					screen: {
						...modelCore.packBuilder.screen,
						opened: null,
					},
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

const clamp = (value: number, min: number, max: number): number => {
	return Math.max(min, Math.min(max, value));
};

updateCores.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.puzzle-screen.user-clicked-remove-from-pack-button": {
			if (!modelCore.packBuilder) {
				return modelCore;
			}

			const pack = modelCore.packBuilder.pack;

			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					pack: FlowPack.remove(pack, msgCore.puzzleIndex),
					screen: {
						t: "screen-puzzle-grid",
						slideIndex: 0,
					},
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

const updateCore: UpdateCore = (input) => {
	return updateCores.reduce(
		(modelCore, updateCore) =>
			updateCore({
				ctx: input.ctx,
				modelCore,
				msgCore: input.msgCore,
			}),
		input.modelCore,
	);
};

const initCore = ({ pack }: { pack: FlowPack }): ModelCore => {
	return {
		pack,
		screen: {
			t: "screen-puzzle-grid",
			slideIndex: 0,
		},
		t: "pack-builder",
	};
};

export const PackBuilderCore = {
	initCore,
	updateCore,
};
