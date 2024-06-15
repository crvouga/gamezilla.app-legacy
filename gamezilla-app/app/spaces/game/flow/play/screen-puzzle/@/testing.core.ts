import { pipe } from "gamezilla-app/@/core";
import { FlowVariantUIPlay } from "../../../@/flow";
import { FlowPack } from "../../../@/flow-pack";
import { FlowPuzzle } from "../../../@/flow-puzzle";
import { CoreFixture } from "../../@/testing";
import type { MsgCore } from "../screen-puzzle.types";

export const ScreenPuzzleCoreFixture = async () => {
	const f = await CoreFixture();
	const puzzle = await FlowPuzzle.random();
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
		FlowVariantUIPlay.toSolutionMsgs({ flow: puzzle.flow }),
		(msgs) =>
			msgs.map((c): MsgCore => ({ t: "got-puzzle-screen-flow-play-msg", c })),
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
