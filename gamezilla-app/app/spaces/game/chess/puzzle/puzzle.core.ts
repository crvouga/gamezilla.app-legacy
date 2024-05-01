import {
	Err,
	type NonEmpty,
	Ok,
	type Posix,
	type RemoteResult,
	type Result,
} from "gamezilla-app/@shared/core";
import type { UserId } from "gamezilla-app/app/@shared/data";
import type { SpaceCtx } from "gamezilla-app/app/spaces/@shared/space";
import { Chess } from "../@shared/chess";
import { EloRating } from "./elo-rating";
import { zip } from "./utils";

export const maxRating = 3212;
export const minRating = 545;
export const maxRatingDeviation = 500;
export const minRatingDeviation = 50;

//
//
//
// Model
//
//
//

type BaseModel = {
	puzzle: Puzzle;
	queue: Puzzle[];
	profile: PuzzleProfile;
	hasLost?: boolean;
	hasUsedHint?: boolean;
	moves: Chess.MoveInput[];
};

type MainModel =
	| {
			t: "started";
			startedAt: Posix;
			hint?: Hint | null;
	  }
	| {
			t: "solved";
			startedAt: Posix;
			endedAt: Posix;
	  }
	| {
			t: "solved-with-hint";
			startedAt: Posix;
			endedAt: Posix;
	  }
	| {
			t: "incorrect";
			startedAt: Posix;
			endedAt: Posix;
	  };

export type CoreModel =
	| {
			t: "loading";
			profile?: PuzzleProfile | null;
			queue?: Puzzle[];
			puzzle?: Puzzle;
	  }
	| (BaseModel & MainModel);

export type ModelServer = CoreModel & {
	requests: { getPuzzles?: RemoteResult<string, null> };
};

export type ModelClient = CoreModel & {
	initializedAt?: number;
	serverNow?: Posix;
};

type Hint = "from" | "from-and-to";

const hintToNextHint: { [key in Hint]: Hint } = {
	from: "from-and-to",
	"from-and-to": "from-and-to",
};

export const isNoMoreHints = (model: CoreModel): boolean => {
	return model.t === "started" && model.hint === "from-and-to";
};

export const isSolved = (model: CoreModel): boolean => {
	return model.t === "solved" || model.t === "solved-with-hint";
};

export const isIncorrect = (model: CoreModel): boolean => {
	return model.t === "incorrect";
};

export const initQuery: PuzzleQuery = {
	ratingRange: [1000, 1500],
};

export const initCore: CoreModel = {
	t: "loading",
};

export type PuzzleQuery = {
	ratingRange: [number, number];
};

export type PuzzleMove = {
	opponentMove: Chess.MoveInput;
	correctMove: Chess.MoveInput;
};

export type Puzzle = {
	puzzleId: string;
	fen: string;
	moves: NonEmpty<PuzzleMove>;
	rating: EloRating;
	ratingDeviation: number;
	popularity: number;
	numberOfPlays: number;
	themes: string[];
	gameUrl: string;
	openingTags: string[];
};

export type PuzzleProfile = {
	userId: UserId;
	eloRating: EloRating;
	puzzleQuery: PuzzleQuery;
};

export type PuzzleInteraction = {
	type: "started" | "solved" | "incorrect" | "solved-with-hint";
	puzzleId: string;
	userId: UserId;
};

//
//
//
// Msg
//
//
//

export type Req =
	| { t: "input-query"; query: PuzzleQuery }
	| { t: "input-move"; moveInput: Chess.MoveInput; didCapture?: boolean }
	| { t: "next" }
	| { t: "retry" }
	| { t: "skip" }
	| { t: "show-hint" };

export type Res = Req & { result: Result<string, CoreModel> };

export type MsgServer = { t: "clock-tick" } | DbMsg;

type DbMsg =
	| { t: "db-got-puzzles"; result: Result<string, Puzzle[]> }
	| { t: "db-got-profile"; result: Result<string, PuzzleProfile | null> }
	| { t: "db-put-profile"; result: Result<string, null> }
	| { t: "db-put-interaction"; result: Result<string, null> }
	| {
			t: "db-got-initial-load";
			result: Result<string, { profile: PuzzleProfile; puzzles: Puzzle[] }>;
	  };

export type MsgClient = Req;

export type MsgToServer = Req;

export type MsgToClient =
	| Res
	| { t: "clock-tick"; now: Posix }
	| (Omit<DbMsg, "result"> & { result: Result<string, CoreModel> });

export const toOpponentColor = (puzzle: Puzzle): Chess.Color => {
	return Chess.toTurn(Chess.initFromFen({ fen: puzzle.fen }));
};

export const toPlayerColor = (puzzle: Puzzle): Chess.Color => {
	return Chess.toOppositeColor(toOpponentColor(puzzle));
};

export const toCorrectMove = (model: CoreModel): Chess.MoveInput | null => {
	if (model.t === "started") {
		return model.puzzle.moves[model.moves.length]?.correctMove ?? null;
	}
	return null;
};

//
//
//
//
// Handle
//
//
//
//

export const toCurrentBoard = (model: CoreModel): Chess.Model => {
	if (model.t === "loading") {
		return Chess.init();
	}

	let board = Chess.initFromFen(model.puzzle);
	const playerMoves: Chess.MoveInput[] = [];

	for (let i = 0; i < model.puzzle.moves.length; i++) {
		const puzzleMove = model.puzzle.moves[i];

		if (!puzzleMove) {
			break;
		}

		const opponentMoved = Chess.move(puzzleMove.opponentMove, board);

		if (opponentMoved.t === "err") {
			break;
		}

		board = opponentMoved.value;

		const playerMove = model.moves[i];

		if (!playerMove) {
			break;
		}

		const playerMoved = Chess.move(playerMove, board);

		if (playerMoved.t === "err") {
			break;
		}

		board = playerMoved.value;

		playerMoves.push(playerMove);

		if (didFailPuzzle(model.puzzle, playerMoves)) {
			break;
		}
	}

	return board;
};

const didSolvePuzzle = (
	puzzle: Puzzle,
	playerMoves: Chess.MoveInput[],
): boolean => {
	return (
		puzzle.moves.length === playerMoves.length &&
		zip(puzzle.moves, playerMoves).every(([puzzleMove, playerMoves]) =>
			Chess.isMoveEqual(puzzleMove.correctMove, playerMoves),
		)
	);
};

const didFailPuzzle = (
	puzzle: Puzzle,
	playerMoves: Chess.MoveInput[],
): boolean => {
	return zip(puzzle.moves, playerMoves).some(
		([puzzleMove, playerMove]) =>
			!Chess.isMoveEqual(puzzleMove.correctMove, playerMove),
	);
};

type CoreCtx = SpaceCtx & {
	now: Posix;
	currentUserId: UserId;
};

export const updateCore = ({
	ctx,
	msg,
	model,
}: {
	ctx: CoreCtx;
	msg: Req;
	model: CoreModel;
}): Result<string, CoreModel> => {
	//
	//
	//
	//

	if (ctx.currentUserId !== ctx.space.hostId) {
		return Err("must-be-host");
	}

	//
	//
	//
	//

	if (model.t === "started") {
		if (msg.t === "input-move") {
			const board = toCurrentBoard(model);

			const moved = Chess.move(msg.moveInput, board);

			if (moved.t === "err") {
				return moved;
			}

			const modelNew: CoreModel = {
				...model,
				moves: [...model.moves, msg.moveInput],
				hint: null,
			};

			if (didSolvePuzzle(model.puzzle, modelNew.moves) && model.hasUsedHint) {
				return Ok({
					...modelNew,
					t: "solved-with-hint",
					endedAt: ctx.now,
					hasLost: true,
					hasUsedHint: true,
				});
			}

			if (didSolvePuzzle(model.puzzle, modelNew.moves)) {
				return Ok({
					...modelNew,
					t: "solved",
					endedAt: ctx.now,
				});
			}

			if (didFailPuzzle(model.puzzle, modelNew.moves)) {
				return Ok({
					...modelNew,
					t: "incorrect",
					hasLost: true,
					endedAt: ctx.now,
				});
			}

			return Ok(modelNew);
		}

		if (msg.t === "show-hint") {
			return Ok({
				...model,
				hint: model.hint ? hintToNextHint[model.hint] : "from",
				hasUsedHint: true,
			});
		}
	}

	if (model.t === "solved") {
		if (msg.t === "next") {
			return Ok(transitionNextPuzzle({ ctx, model }));
		}
	}

	if (model.t === "solved-with-hint") {
		if (msg.t === "next") {
			return Ok(transitionNextPuzzle({ ctx, model }));
		}
	}

	if (model.t === "incorrect") {
		if (msg.t === "next") {
			return Ok(transitionNextPuzzle({ ctx, model }));
		}

		if (msg.t === "skip") {
			return Ok(transitionNextPuzzle({ ctx, model }));
		}

		if (msg.t === "retry") {
			return Ok({
				...model,
				moves: [],
				t: "started",
				hasLost: true,
			});
		}
	}

	return Err("unhandled");
};

const transitionNextPuzzle = ({
	model,
	ctx,
}: {
	ctx: CoreCtx;
	model: CoreModel;
}): CoreModel => {
	if (model.t === "loading") {
		return model;
	}

	const [puzzleNew, ...queueNew] = model.queue;

	if (!puzzleNew) {
		return {
			...model,
			puzzle: puzzleNew,
			t: "loading",
		};
	}

	const profileNew: PuzzleProfile = {
		...model.profile,
		eloRating: toNextEloRating(model) ?? model.profile.eloRating,
	};

	return {
		t: "started",
		hasLost: false,
		hasUsedHint: false,
		hint: null,
		startedAt: ctx.now,
		moves: [],
		profile: profileNew,
		puzzle: puzzleNew,
		queue: queueNew,
	};
};

export const toNextEloRating = (model: CoreModel): EloRating | null => {
	if (model.t === "loading") {
		return null;
	}

	if (model.hasLost) {
		return EloRating.toNextRating({
			endGame: "lost",
			opponentRating: model.puzzle.rating,
			playerRating: model.profile.eloRating,
		});
	}

	if (model.t === "started") {
		return null;
	}

	if (model.t === "solved") {
		return EloRating.toNextRating({
			endGame: "win",
			opponentRating: model.puzzle.rating,
			playerRating: model.profile.eloRating,
		});
	}

	if (model.t === "incorrect" || model.t === "solved-with-hint") {
		return EloRating.toNextRating({
			endGame: "lost",
			opponentRating: model.puzzle.rating,
			playerRating: model.profile.eloRating,
		});
	}

	return null;
};

export const transitionLoadingToStarted = ({
	model,
	ctx,
}: {
	ctx: { now: Posix };
	model: CoreModel;
}): CoreModel => {
	if (model.t === "loading") {
		const profile = model.profile;

		if (!profile) {
			return model;
		}

		const puzzle = model.puzzle;
		const queue = model.queue;

		if (puzzle) {
			return {
				hasLost: false,
				hasUsedHint: false,
				hint: null,
				profile: profile,
				queue: queue ?? [],
				puzzle,
				moves: [],
				startedAt: ctx.now,
				t: "started",
			};
		}

		const [head, ...tail] = queue ?? [];

		if (!head) {
			return model;
		}

		return {
			...model,
			profile: profile,
			queue: tail,
			puzzle: head,
			moves: [],
			startedAt: ctx.now,
			t: "started",
		};
	}

	return model;
};
