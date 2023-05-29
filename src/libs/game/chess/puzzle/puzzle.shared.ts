import { UserId } from "@gamezilla/shared/app";
import { Err, Ok, Posix, Result } from "@gamezilla/shared/core";
import * as Chess from "../chess/chess";
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

export type SharedModel = {
  startedAt: number | null;
  puzzleEvents: PuzzleEvent[];
  puzzles: Puzzle[];
  puzzleProfile: PuzzleProfile | null;
};

export type ServerModel = SharedModel;

export type ClientModel = SharedModel & {
  initializedAt?: number;
  backendNow?: Posix;
  openedModal?: "settings" | null;
  draftQuery?: PuzzleQuery;
};

type Hint = "none" | "from" | "from-and-to";

export const toNext: { [key in Hint]: Hint } = {
  none: "from",
  from: "from-and-to",
  "from-and-to": "from-and-to",
};

export const initQuery: PuzzleQuery = {
  ratingRange: [1000, 1500],
};

export const initShared: SharedModel = {
  puzzleEvents: [],
  puzzles: [],
  puzzleProfile: null,
  startedAt: null,
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
  query: PuzzleQuery;
};

export type PuzzleInteraction = {
  type: "solved" | "incorrect" | "solve-with-hint";
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

export type ServerMsg =
  | { t: "clock-tick" }
  | { t: "got-puzzles"; result: Result<string, Puzzle[]> }
  | { t: "got-profile"; result: Result<string, PuzzleProfile | null> }
  | {
      t: "got-initial-load";
      result: Result<
        string,
        { puzzleProfile: PuzzleProfile; puzzles: Puzzle[] }
      >;
    }
  | { t: "put-interaction"; result: Result<string, null> }
  | { t: "put-profile"; result: Result<string, null> };

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
  | { t: "got-puzzles"; result: Result<string, SharedModel> }
  | { t: "got-profile"; result: Result<string, SharedModel> }
  | { t: "got-initial-load"; result: Result<string, SharedModel> }
  | { t: "put-profile"; result: Result<string, SharedModel> }
  | { t: "put-interaction"; result: Result<string, SharedModel> };

//
//
//
//
// Status
//
//
//

type PuzzleEvent =
  | {
      type: "user-moved";
      move: Chess.MoveInput;
      happenedAt: Posix;
    }
  | {
      type: "user-used-hint";
      happenedAt: Posix;
    }
  | {
      type: "user-retried";
      happenedAt: Posix;
    };

export type PuzzleState =
  | {
      type: "loading";
    }
  | {
      type: "solving";
      puzzle: Puzzle;
      puzzleProfile: PuzzleProfile;
      board: Chess.Model;
      playerMoves: Chess.MoveInput[];
      hint: Hint;
    }
  | {
      type: "solved";
      puzzle: Puzzle;
      puzzleProfile: PuzzleProfile;
      board: Chess.Model;
      nextEloRating: EloRating;
      endedAt: number;
    }
  | {
      type: "solved-with-hint";
      puzzle: Puzzle;
      puzzleProfile: PuzzleProfile;
      board: Chess.Model;
      nextEloRating: EloRating;
      endedAt: number;
    }
  | {
      type: "incorrect";
      puzzle: Puzzle;
      puzzleProfile: PuzzleProfile;
      board: Chess.Model;
      nextEloRating: EloRating;
      endedAt: number;
    };

const reducer = (state: PuzzleState, event: PuzzleEvent): PuzzleState => {
  if (state.type === "loading") {
    return state;
  }

  if (state.type === "solved") {
    return state;
  }

  if (state.type === "incorrect") {
    return state;
  }

  if (state.type === "solved-with-hint") {
    return state;
  }

  if (state.type === "solving") {
    if (event.type === "user-moved") {
      const playerMoved = Chess.move(event.move, state.board);

      if (playerMoved.t === "err") {
        return state;
      }

      const puzzleMove = state.puzzle.opponentMoves[state.playerMoves.length];

      const puzzleMoved = puzzleMove
        ? Chess.move(puzzleMove, playerMoved.value)
        : Ok(playerMoved.value);

      if (puzzleMoved.t === "err") {
        return state;
      }

      const boardNew = puzzleMoved.value;
      const playerMovesNew = [...state.playerMoves, event.move];

      if (isMovesEqual(state.puzzle.correctMoves, playerMovesNew)) {
        if (state.hint !== "none") {
          return {
            ...state,
            board: boardNew,
            type: "solved-with-hint",
            endedAt: event.happenedAt,
            nextEloRating: EloRating.toNextRating({
              endGame: "lost",
              opponentRating: state.puzzle.rating,
              playerRating: state.puzzleProfile.eloRating,
            }),
          };
        }

        return {
          ...state,
          board: boardNew,
          type: "solved",
          endedAt: event.happenedAt,
          nextEloRating: EloRating.toNextRating({
            endGame: "win",
            opponentRating: state.puzzle.rating,
            playerRating: state.puzzleProfile.eloRating,
          }),
        };
      }

      return {
        ...state,
        board: boardNew,
        playerMoves: playerMovesNew,
      };
    }
    return state;
  }

  return state;
};

export const toState = (model: SharedModel): PuzzleState => {
  const puzzle = model.puzzles[0];

  if (!puzzle) {
    return {
      type: "loading",
    };
  }

  const puzzleProfile = model.puzzleProfile;

  if (!puzzleProfile) {
    return {
      type: "loading",
    };
  }

  const moved = Chess.move(puzzle.opponentMoves[0], Chess.initFromFen(puzzle));

  if (moved.t === "err") {
    return {
      type: "loading",
    };
  }

  const initialState: PuzzleState = {
    type: "solving",
    puzzle,
    puzzleProfile,
    board: moved.value,
    playerMoves: [],
    hint: "none",
  };

  const state = model.puzzleEvents.reduce<PuzzleState>(
    (state, event) => reducer(state, event),
    initialState
  );

  return state;
};

const isMovesEqual = (a: Chess.MoveInput[], b: Chess.MoveInput[]): boolean => {
  return (
    a.length === b.length && zip(a, b).every(([a, b]) => isMoveEqual(a, b))
  );
};

const isMoveEqual = (a: Chess.MoveInput, b: Chess.MoveInput): boolean => {
  return a.from === b.from && a.to === b.to;
};

export const toOpponentColor = (puzzle: Puzzle): Chess.Color => {
  const board = Chess.initFromFen({ fen: puzzle.fen });
  return Chess.toTurn(board);
};

export const toPlayerColor = (puzzle: Puzzle): Chess.Color => {
  return Chess.toOppositeColor(toOpponentColor(puzzle));
};

export const toCorrectMove = (model: SharedModel): Chess.MoveInput | null => {
  const state = toState(model);
  if (state.type === "solving") {
    return state.puzzle.correctMoves[state.playerMoves.length] ?? null;
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

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: { now: Posix; currentUserId: UserId; hostId: UserId };
  msg: Req;
  model: SharedModel;
}): Result<string, SharedModel> => {
  switch (msg.t) {
    case "input-move": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const state = toState(model);

      if (state.type !== "solving") {
        return Err("must-be-solving");
      }

      const moved = Chess.move(msg.moveInput, state.board);

      if (moved.t === "err") {
        return moved;
      }

      const modelNew = appendEvent(model, {
        type: "user-moved",
        move: msg.moveInput,
        happenedAt: ctx.now,
      });

      return Ok(modelNew);
    }

    case "next": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const status = toState(model);

      if (status.type !== "solved") {
        return Err("must-be-solved");
      }

      const modelNew = nextPuzzle({
        nextEloRating: status.nextEloRating,
        model,
        ctx,
      });

      return Ok(modelNew);
    }

    case "retry": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const modelNew = appendEvent(
        {
          ...model,
          startedAt: ctx.now,
        },
        {
          type: "user-retried",
          happenedAt: ctx.now,
        }
      );

      return Ok(modelNew);
    }

    case "skip": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const status = toState(model);

      if (status.type !== "incorrect") {
        return Err("must-be-incorrect");
      }

      const modelNew = nextPuzzle({
        nextEloRating: status.nextEloRating,
        model,
        ctx,
      });

      return Ok(modelNew);
    }

    case "show-hint": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const modelNew = appendEvent(model, {
        type: "user-used-hint",
        happenedAt: ctx.now,
      });

      return Ok(modelNew);
    }

    case "input-query": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const modelNew = nextPuzzle({
        ctx,
        model: {
          ...model,
          puzzleProfile: model.puzzleProfile
            ? {
                ...model.puzzleProfile,
                query: msg.query,
              }
            : null,
        },
      });

      return Ok(modelNew);
    }

    case "init": {
      return Ok(model);
    }

    default: {
      const check: never = msg;
      return check;
    }
  }
};

const appendEvent = (model: SharedModel, event: PuzzleEvent): SharedModel => {
  return {
    ...model,
    puzzleEvents: [...model.puzzleEvents, event],
  };
};

const nextPuzzle = ({
  ctx,
  model,
  nextEloRating,
}: {
  ctx: { now: Posix };
  nextEloRating?: EloRating | null;
  model: SharedModel;
}): SharedModel => {
  return {
    startedAt: ctx.now,
    puzzleEvents: [],
    puzzles: model.puzzles.slice(1),
    puzzleProfile:
      model.puzzleProfile && nextEloRating
        ? {
            ...model.puzzleProfile,
            eloRating: nextEloRating,
          }
        : model.puzzleProfile,
  };
};
