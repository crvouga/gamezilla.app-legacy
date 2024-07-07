import { withEventMeta } from "gamezilla-app/app/spaces/@/event";
import { FlowPlay } from "../../../@/flow";
import { FlowPack } from "../../../@/flow-pack";
import { FlowPuzzle } from "../../../@/flow-puzzle";
import {
	FlowPlayClientFixture,
	type FixtureUpdateInput,
} from "../../@/testing";

const toCompletePuzzleMsgs = (puzzle: FlowPuzzle) =>
	FlowPlay.toSolutionMsgs({
		flow: puzzle.flow,
	}).map(
		(c): FixtureUpdateInput => ({
			msgCore: withEventMeta({
				t: "flow-variant-play",
				c,
			}),
		}),
	);

export const ScreenPlayPuzzleClientFixture = async () => {
	const f = await FlowPlayClientFixture();
	const puzzle = await FlowPuzzle.random();
	const nextPuzzle = await FlowPuzzle.random();
	const prevPuzzle = await FlowPuzzle.random();
	const pack = await FlowPack.random({
		puzzleIds: [prevPuzzle.id, puzzle.id, nextPuzzle.id],
	});
	const puzzleIndex = 1;
	const prevPuzzleIndex = 0;
	const nextPuzzleIndex = 2;

	f.initial.model = {
		...f.initial.model,
		flowPuzzles: {
			[puzzle.id]: puzzle,
			[nextPuzzle.id]: nextPuzzle,
			[prevPuzzle.id]: prevPuzzle,
		},
		flowPacks: {
			[pack.id]: pack,
		},
	};

	const initial = f.update(f.initial, [
		{
			msg: {
				t: "user-clicked-open-pack-list-item",
				pack,
			},
		},
		{
			msg: {
				t: "user-clicked-open-puzzle-grid-item",
				flowPuzzle: puzzle,
				puzzleIndex,
			},
		},
	]);

	const firstPuzzle = prevPuzzle;
	const firstPuzzleIndex = 0;
	const lastPuzzle = nextPuzzle;
	const lastPuzzleIndex = 2;

	const completePuzzleMsgs = toCompletePuzzleMsgs(puzzle);
	const completeLastPuzzleMsgs: FixtureUpdateInput[] = [
		{
			msgCore: withEventMeta({
				t: "user-clicked-next-puzzle",
				nextPuzzleIndex: lastPuzzleIndex,
				nextPuzzle: lastPuzzle,
			}),
		},
		...toCompletePuzzleMsgs(lastPuzzle),
	];

	return {
		...f,
		completeLastPuzzleMsgs,
		completePuzzleMsgs,
		initial,
		pack,
		puzzle,
		puzzleIndex,
		firstPuzzle,
		firstPuzzleIndex,
		lastPuzzle,
		lastPuzzleIndex,
		//
		nextPuzzle,
		nextPuzzleIndex,
		prevPuzzle,
		prevPuzzleIndex,
	};
};
