import { NonEmpty, pipe } from "gamezilla-app/@/core";
import type { FlowVariant } from "../../../@/flow";
import { FlowPack } from "../../../@/flow-pack";
import { FlowPuzzle } from "../../../@/flow-puzzle";
import { FlowPlay } from "../../../@/flow/flow-play";
import { CoreFixture } from "../../@/fixture";
import { ScreenPlayPuzzleCore } from "../screen-play-puzzle.core";
import type { ModelCore, MsgCore } from "../screen-play-puzzle.types";

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
		FlowPlay.toSolutionMsgs({ flow: puzzle.flow }),
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

	const updates = (init: ModelCore, msgs: MsgCore[]): NonEmpty<ModelCore> => {
		const models: NonEmpty<ModelCore> = [init];
		for (const msg of msgs) {
			const last = NonEmpty.last(models);
			const latest = ScreenPlayPuzzleCore.updateScreen(last, msg);
			models.push(latest);
		}
		return models;
	};

	const update = (init: ModelCore, msgs: MsgCore[]): ModelCore => {
		const outputs = updates(init, msgs);
		return NonEmpty.last(outputs);
	};

	const init: ModelCore = ScreenPlayPuzzleCore.initCore({
		flowPack: f.pack,
		flowPuzzle: f.puzzle,
		puzzleIndex: f.puzzleIndex,
	});

	return {
		...f,
		updates,
		initParent: f.init,
		updateParent: f.update,
		update,
		init,
	};
};
