import { pipe } from "gamezilla-app/@/core";
import { FlowVariantPlay, type FlowVariant } from "../../../@/flow";
import { FlowPack } from "../../../@/flow-pack";
import { FlowPuzzle } from "../../../@/flow-puzzle";
import { CoreFixture } from "../../@/testing";
import type { ModelCore, MsgCore } from "../screen-play-puzzle.types";
import { ScreenPuzzleCore } from "../screen-play-puzzle.core";

export const ScreenPuzzlePlayCoreFixture = async (input?: {
	flow?: FlowVariant.Model;
}) => {
	const f = await CoreFixture();
	const puzzle = await FlowPuzzle.random(input);
	const puzzleIndex = 1;
	const prevPuzzle = await FlowPuzzle.random();
	const prevPuzzleIndex = 0;
	const nextPuzzle = await FlowPuzzle.random();
	const nextPuzzleIndex = 2;
	const pack = await FlowPack.random({
		puzzleIds: [prevPuzzle.id, puzzle.id, nextPuzzle.id],
	});

	const init = f.update(f.init, [
		{
			t: "user-clicked-open-pack-list-item",
			pack,
		},
		{
			t: "user-clicked-open-puzzle-grid-item",
			flowPuzzle: puzzle,
			puzzleIndex,
		},
	]);

	const completePuzzleMsgs = pipe(
		FlowVariantPlay.toSolutionMsgs({ flow: puzzle.flow }),
		(msgs) => msgs.map((c): MsgCore => ({ t: "flow-variant-play", c })),
	);

	return {
		...f,
		completePuzzleMsgs,
		puzzle,
		puzzleIndex,
		nextPuzzle,
		nextPuzzleIndex,
		prevPuzzle,
		prevPuzzleIndex,
		pack,
		init,
	};
};

export const ScreenPuzzlePlayCoreChildFixture = async (input?: {
	flow?: FlowVariant.Model;
}) => {
	const f = await ScreenPuzzlePlayCoreFixture(input);

	const update = (init: ModelCore, msgs: MsgCore[]): ModelCore => {
		let model: ModelCore = init;
		for (const msg of msgs) {
			model = ScreenPuzzleCore.updateScreen(model, msg);
		}
		return model;
	};

	const init: ModelCore = ScreenPuzzleCore.initCore({
		flowPack: f.pack,
		flowPuzzle: f.puzzle,
		puzzleIndex: f.puzzleIndex,
	});

	return {
		...f,
		initParent: f.init,
		updateParent: f.update,
		update,
		init,
	};
};
