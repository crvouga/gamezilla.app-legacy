import { UserId } from "@gamezilla/shared/app";
import { Err, Ok, Posix, Result } from "@gamezilla/shared/core";
import * as Chess from "../chess/chess";
import { EloRating } from "./elo-rating";
import { interleave, zip } from "./utils";

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

export type SharedModel =
  | {
      t: "loading";
      profile?: PuzzleProfile | null;
      queue?: Puzzle[];
    }
  | {
      t: "in-progress";
      startedAt: Posix;
      moves: Chess.MoveInput[];
      puzzle: Puzzle;
      queue: Puzzle[];
      profile: PuzzleProfile;
      hasLost?: boolean;
      hint?: Hint | null;
    }
  | {
      t: "solved";
      startedAt: Posix;
      endedAt: Posix;
      puzzle: Puzzle;
      moves: Chess.MoveInput[];
      queue: Puzzle[];
      profile: PuzzleProfile;
      hasLost?: boolean;
    }
  | {
      t: "solved-with-hint";
      startedAt: Posix;
      endedAt: Posix;
      puzzle: Puzzle;
      moves: Chess.MoveInput[];
      queue: Puzzle[];
      profile: PuzzleProfile;
      hasLost?: boolean;
    }
  | {
      t: "incorrect";
      startedAt: Posix;
      endedAt: Posix;
      puzzle: Puzzle;
      moves: Chess.MoveInput[];
      profile: PuzzleProfile;
      queue: Puzzle[];
      hasLost?: boolean;
    };

export type ServerModel = SharedModel;

export type ClientModel = SharedModel & {
  initializedAt?: number;
  backendNow?: Posix;
  openedModal?: "settings" | null;
  draftQuery?: PuzzleQuery;
};

type Hint = "from" | "from-and-to";

const hintToNextHint: { [key in Hint]: Hint } = {
  from: "from-and-to",
  "from-and-to": "from-and-to",
};

export const isNoMoreHints = (model: SharedModel): boolean => {
  return model.t === "in-progress" && model.hint === "from-and-to";
};

export const initQuery: PuzzleQuery = {
  ratingRange: [1000, 1500],
};

export const initShared: SharedModel = {
  t: "loading",
};

export type PuzzleQuery = {
  ratingRange: [number, number];
};

export type Puzzle = {
  puzzleId: string;
  fen: string;
  opponentMoves: [Chess.MoveInput, ...Chess.MoveInput[]];
  correctMoves: [Chess.MoveInput, ...Chess.MoveInput[]];
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
  type: "solved" | "incorrect" | "solved-with-hint";
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
  | { t: "init" }
  | { t: "input-query"; query: PuzzleQuery }
  | { t: "input-move"; moveInput: Chess.MoveInput }
  | { t: "next" }
  | { t: "retry" }
  | { t: "skip" }
  | { t: "show-hint" };

export type Res = Req & { result: Result<string, SharedModel> };

export type ServerMsg = { t: "clock-tick" } | DbMsg;

type DbMsg =
  | { t: "db-got-puzzles"; result: Result<string, Puzzle[]> }
  | { t: "db-got-profile"; result: Result<string, PuzzleProfile | null> }
  | { t: "db-put-interaction"; result: Result<string, null> }
  | { t: "db-put-profile"; result: Result<string, null> }
  | {
      t: "db-got-initial-load";
      result: Result<
        string,
        { puzzleProfile: PuzzleProfile; puzzles: Puzzle[] }
      >;
    };

export type ClientMsg =
  | Req
  | { t: "input-draft-query"; query: PuzzleQuery }
  | { t: "animate" }
  | { t: "opened-modal"; modal: "settings" }
  | { t: "closed-modal" }
  | { t: "clicked-save" };

export type ToServer = Req;

export type ToClient =
  | Res
  | { t: "clock-tick"; now: Posix }
  | (Omit<DbMsg, "result"> & { result: Result<string, SharedModel> });

export const toOpponentColor = (puzzle: Puzzle): Chess.Color => {
  const board = Chess.initFromFen({ fen: puzzle.fen });
  return Chess.toTurn(board);
};

export const toPlayerColor = (puzzle: Puzzle): Chess.Color => {
  return Chess.toOppositeColor(toOpponentColor(puzzle));
};

export const toCorrectMove = (model: SharedModel): Chess.MoveInput | null => {
  if (model.t === "in-progress") {
    return model.puzzle.correctMoves[model.moves.length] ?? null;
  }
  return null;
};

export type DbReq = { t: "db-get" } | { t: "db-put"; model: SharedModel };

export type DbRes = DbReq & { result: Result<string, SharedModel> };

//
//
//
//
// Handle
//
//
//
//

export const toCurrentBoard = (model: SharedModel): Chess.Model => {
  if (model.t === "loading") {
    return Chess.init();
  }
  const moves = interleave(model.puzzle.opponentMoves, model.moves);
  let board = Chess.initFromFen(model.puzzle);
  for (const move of moves) {
    const moved = Chess.move(move, board);
    if (moved.t === "ok") {
      board = moved.value;
    }
  }
  return board;
};

const didSolvePuzzle = (puzzle: Puzzle, moves: Chess.MoveInput[]): boolean => {
  return (
    puzzle.correctMoves.length === moves.length &&
    zip(puzzle.correctMoves, moves).every(
      ([a, b]) => a.from === b.from && a.to === b.to
    )
  );
};

const didFailPuzzle = (puzzle: Puzzle, moves: Chess.MoveInput[]): boolean => {
  return zip(puzzle.correctMoves, moves).some(
    ([a, b]) => !(a.from === b.from && a.to === b.to)
  );
};

type Ctx = { now: Posix; currentUserId: UserId; hostId: UserId };

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: Ctx;
  msg: Req;
  model: SharedModel;
}): Result<string, SharedModel> => {
  //
  //
  //
  //

  if (ctx.currentUserId !== ctx.hostId) {
    return Err("must-be-host");
  }

  //
  //
  //
  //

  if (model.t === "in-progress") {
    if (msg.t === "input-move") {
      const board = toCurrentBoard(model);

      const moved = Chess.move(msg.moveInput, board);

      if (moved.t === "err") {
        return moved;
      }

      const modelNew: SharedModel = {
        ...model,
        moves: [...model.moves, msg.moveInput],
      };

      if (didSolvePuzzle(model.puzzle, modelNew.moves) && model.hint) {
        return Ok({
          ...modelNew,
          t: "solved-with-hint",
          endedAt: ctx.now,
          hasLost: true,
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
        t: "in-progress",
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
  ctx: Ctx;
  model: SharedModel;
}): SharedModel => {
  if (model.t === "loading") {
    return model;
  }

  const puzzleNext = model.queue[0];

  if (!puzzleNext) {
    return { t: "loading" };
  }

  const eloRating = toNextEloRating(model) ?? model.profile.eloRating;

  return {
    t: "in-progress",
    hasLost: false,
    startedAt: ctx.now,
    moves: [],
    profile: { ...model.profile, eloRating },
    puzzle: puzzleNext,
    queue: model.queue.slice(1),
    hint: null,
  };
};

export const toNextEloRating = (model: SharedModel): EloRating | null => {
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

  if (model.t === "in-progress") {
    return model.profile.eloRating;
  }

  if (model.t === "solved") {
    return EloRating.toNextRating({
      endGame: "win",
      opponentRating: model.puzzle.rating,
      playerRating: model.profile.eloRating,
    });
  }

  return EloRating.toNextRating({
    endGame: "lost",
    opponentRating: model.puzzle.rating,
    playerRating: model.profile.eloRating,
  });
};
