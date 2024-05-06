import { isErr } from "gamezilla-app/@/core";
import { FlowVariantUIPlay } from "../../../@/flow";
import { FlowPack } from "../../../@/flow-pack/flow-pack";
import { FlowPackGridUI } from "../../../@/flow-pack/flow-pack-grid/flow-pack-grid-ui";
import { UpdateCore } from "../../create.types";
import { EditPackNameCore } from "./edit-pack-name/edit-pack-name.core";
import { ModelCore } from "./pack-builder.types";

const updates: UpdateCore[] = [];

updates.push(({ modelCore, msgCore }) => {
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
					slideIndex: 0,
					screen: {
						t: "screen-puzzle-grid",
					},
					pack: msgCore.created.value,
					editPackName: EditPackNameCore.init({
						pack: msgCore.created.value,
					}),
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

updates.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.user-clicked-exit-button": {
			return {
				...modelCore,
				opened: { t: "list" },
				listTab: "packs",
			};
		}
		default: {
			return modelCore;
		}
	}
});

updates.push(({ modelCore, msgCore }) => {
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

updates.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.user-opened-add-puzzle-screen": {
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

updates.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.user-closed-add-puzzle-screen": {
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
					},
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

updates.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "pack-builder.user-clicked-pack-item": {
			if (!modelCore.packBuilder) {
				return modelCore;
			}

			const puzzleId =
				modelCore.packBuilder.pack.puzzleIds[msgCore.puzzleIndex];

			if (puzzleId !== msgCore.puzzle.id) {
				return modelCore;
			}

			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					screen: {
						opened: null,
						t: "screen-puzzle",
						puzzleIndex: msgCore.puzzleIndex,
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

updates.push(({ modelCore, msgCore }) => {
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

			const slideIndex = FlowPackGridUI.toSlideIndex(puzzleIndex);

			return {
				...modelCore,
				packBuilder: {
					...modelCore.packBuilder,
					slideIndex: slideIndex,
					screen: {
						t: "screen-puzzle-grid",
					},
				},
			};
		}

		default: {
			return modelCore;
		}
	}
});

updates.push((input) => {
	switch (input.msgCore.t) {
		case "pack-builder.user-changed-slide": {
			if (!input.modelCore.packBuilder) {
				return input.modelCore;
			}
			return {
				...input.modelCore,
				packBuilder: {
					...input.modelCore.packBuilder,
					slideIndex: input.msgCore.newSlideIndex,
				},
			};
		}
		default: {
			return input.modelCore;
		}
	}
});

updates.push(({ modelCore, msgCore }) => {
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

updates.push(({ modelCore, msgCore }) => {
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

updates.push(({ modelCore, msgCore }) => {
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

updates.push(({ modelCore, msgCore }) => {
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

updates.push(({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "remove-puzzle-from-pack.user-clicked-remove-from-pack-button": {
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
					},
				},
			};
		}
		default: {
			return modelCore;
		}
	}
});

updates.push((input) => {
	if (!input.modelCore.packBuilder) {
		return input.modelCore;
	}

	return {
		...input.modelCore,
		packBuilder: {
			...input.modelCore.packBuilder,
			slideIndex: FlowPackGridUI.clampSlideIndex(
				input.modelCore.packBuilder.slideIndex,
				input.modelCore.packBuilder.pack.puzzleIds.length,
			),
		},
	};
});

const update: UpdateCore = (input) => {
	return updates.reduce(
		(modelCore, updateCore) =>
			updateCore({
				ctx: input.ctx,
				msgCore: input.msgCore,
				modelCore,
			}),
		input.modelCore,
	);
};

const init = ({ pack }: { pack: FlowPack }): ModelCore => {
	return {
		pack,
		slideIndex: 0,
		screen: {
			t: "screen-puzzle-grid",
		},
		editPackName: EditPackNameCore.init({
			pack,
		}),
	};
};

const toSlideIndex = (modelCore: ModelCore | null): number => {
	return modelCore?.slideIndex ?? 0;
};

export const PackBuilderCore = {
	toSlideIndex,
	init,
	update,
};
