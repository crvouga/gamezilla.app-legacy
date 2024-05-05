import { isErr } from "gamezilla-app/@/core";
import { FlowVariantUIPlay } from "../../../@/flow";
import { FlowPack } from "../../../@/flow-pack/flow-pack";
import { SyncReducer } from "../../create.core";
import { ModelSync } from "./pack-builder.core";

const reducers: SyncReducer[] = [];

reducers.push(({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "user-created-pack": {
			if (isErr(msgSync.created)) {
				return modelSync;
			}

			return {
				...modelSync,
				opened: { t: "pack-builder" },
				packBuilder: {
					t: "pack-builder",
					opened: { t: null },
					screen: {
						t: "screen-puzzle-grid",
						pageIndex: 0,
					},
					pack: msgSync.created.value,
				},
			};
		}
		default: {
			return modelSync;
		}
	}
});

reducers.push(({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "pack-builder.user-clicked-exit-button": {
			return {
				...modelSync,
				puzzleBuilder: modelSync.puzzleBuilder,
				packBuilder: modelSync.packBuilder,
				opened: { t: "list" },
				listTab: "packs",
			};
		}
		default: {
			return modelSync;
		}
	}
});

reducers.push(({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "pack-builder.user-clicked-add-puzzle-item": {
			if (!modelSync.packBuilder) {
				return modelSync;
			}
			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					pack: FlowPack.add(modelSync.packBuilder.pack, msgSync.puzzle.id),
					screen: {
						t: "screen-puzzle-grid",
						pageIndex: 0,
					},
					opened: {
						t: null,
					},
				},
			};
		}
		default: {
			return modelSync;
		}
	}
});

reducers.push(({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "pack-builder.user-clicked-open-add-puzzle-button": {
			if (!modelSync.packBuilder) {
				return modelSync;
			}
			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					screen: {
						t: "add-puzzle",
					},
				},
			};
		}
		default: {
			return modelSync;
		}
	}
});

reducers.push(({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "pack-builder.user-closed-add-puzzle": {
			if (!modelSync.packBuilder) {
				return modelSync;
			}
			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					opened: {
						t: null,
					},
					screen: {
						t: "screen-puzzle-grid",
						pageIndex: 0,
					},
				},
			};
		}
		default: {
			return modelSync;
		}
	}
});

reducers.push(({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "pack-builder.user-clicked-pack-item": {
			if (!modelSync.packBuilder) {
				return modelSync;
			}

			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					screen: {
						opened: null,
						t: "screen-puzzle",
						puzzleIndex: msgSync.index,
						puzzle: msgSync.puzzle,
						playUI: FlowVariantUIPlay.init({
							flow: msgSync.puzzle.flow,
						}),
					},
				},
			};
		}

		default: {
			return modelSync;
		}
	}
});

reducers.push(({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "pack-builder.user-clicked-exit-puzzle-button": {
			if (!modelSync.packBuilder) {
				return modelSync;
			}

			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					screen: {
						t: "screen-puzzle-grid",
						pageIndex: 0,
					},
				},
			};
		}

		default: {
			return modelSync;
		}
	}
});

reducers.push(({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "pack-builder.flow-play-ui": {
			if (!modelSync.packBuilder) {
				return modelSync;
			}

			if (modelSync.packBuilder.screen.t !== "screen-puzzle") {
				return modelSync;
			}

			const screen = modelSync.packBuilder.screen;

			const updated = FlowVariantUIPlay.update({
				flow: screen.puzzle.flow,
				model: screen.playUI,
				msg: msgSync.c,
			});

			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					screen: {
						opened: null,
						t: "screen-puzzle",
						puzzleIndex: modelSync.packBuilder.screen.puzzleIndex,
						puzzle: modelSync.packBuilder.screen.puzzle,
						playUI: updated,
					},
				},
			};
		}
		default: {
			return modelSync;
		}
	}
});

reducers.push(({ modelSync, msgSync }) => {
	if (modelSync.packBuilder?.screen.t !== "screen-puzzle") {
		return modelSync;
	}

	switch (msgSync.t) {
		case "pack-builder.user-clicked-next-puzzle-button": {
			const indexOfNextPuzzle = modelSync.packBuilder.pack.puzzleIds.indexOf(
				msgSync.nextPuzzle.id,
			);
			if (indexOfNextPuzzle === -1) {
				return modelSync;
			}
			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					screen: {
						t: "screen-puzzle",
						opened: null,
						puzzleIndex: clamp(
							modelSync.packBuilder.screen.puzzleIndex + 1,
							0,
							modelSync.packBuilder.pack.puzzleIds.length - 1,
						),
						playUI: FlowVariantUIPlay.init({
							flow: msgSync.nextPuzzle.flow,
						}),
						puzzle: msgSync.nextPuzzle,
					},
				},
			};
		}

		default: {
			return modelSync;
		}
	}
});

reducers.push(({ modelSync, msgSync }) => {
	if (modelSync.packBuilder?.screen.t !== "screen-puzzle") {
		return modelSync;
	}

	switch (msgSync.t) {
		case "pack-builder.user-clicked-previous-puzzle-button": {
			const indexOfPreviousPuzzle =
				modelSync.packBuilder.pack.puzzleIds.indexOf(msgSync.previousPuzzle.id);
			if (indexOfPreviousPuzzle === -1) {
				return modelSync;
			}
			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					screen: {
						t: "screen-puzzle",
						opened: null,
						puzzleIndex: clamp(
							modelSync.packBuilder.screen.puzzleIndex - 1,
							0,
							modelSync.packBuilder.pack.puzzleIds.length - 1,
						),
						playUI: FlowVariantUIPlay.init({
							flow: msgSync.previousPuzzle.flow,
						}),
						puzzle: msgSync.previousPuzzle,
					},
				},
			};
		}
		default: {
			return modelSync;
		}
	}
});

reducers.push(({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "pack-builder.puzzle-screen.user-clicked-more-button": {
			if (!modelSync.packBuilder) {
				return modelSync;
			}
			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					screen: {
						...modelSync.packBuilder.screen,
						opened: "more",
					},
				},
			};
		}
		case "pack-builder.puzzle-screen.user-closed-more-drawer": {
			if (!modelSync.packBuilder) {
				return modelSync;
			}
			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					screen: {
						...modelSync.packBuilder.screen,
						opened: null,
					},
				},
			};
		}
		default: {
			return modelSync;
		}
	}
});

const clamp = (value: number, min: number, max: number): number => {
	return Math.max(min, Math.min(max, value));
};

reducers.push(({ modelSync, msgSync }) => {
	switch (msgSync.t) {
		case "pack-builder.puzzle-screen.user-clicked-remove-from-pack-button": {
			if (!modelSync.packBuilder) {
				return modelSync;
			}

			const pack = modelSync.packBuilder.pack;

			return {
				...modelSync,
				packBuilder: {
					...modelSync.packBuilder,
					pack: FlowPack.remove(pack, msgSync.puzzleIndex),
					screen: {
						t: "screen-puzzle-grid",
						pageIndex: 0,
					},
				},
			};
		}
		default: {
			return modelSync;
		}
	}
});

const reducer: SyncReducer = (input) => {
	return reducers.reduce(
		(modelSync, reducer) =>
			reducer({
				ctx: input.ctx,
				modelSync,
				msgSync: input.msgSync,
			}),
		input.modelSync,
	);
};

const initSync = ({ pack }: { pack: FlowPack }): ModelSync => {
	return {
		pack,
		screen: {
			t: "screen-puzzle-grid",
			pageIndex: 0,
		},
		t: "pack-builder",
	};
};

export const PackBuilderSync = {
	initSync,
	reducer,
};
