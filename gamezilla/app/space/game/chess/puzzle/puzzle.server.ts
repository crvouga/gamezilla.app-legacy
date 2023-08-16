import {
  Cmd,
  Err,
  Ok,
  Result,
  Sub,
  Time,
  andThen,
  eq,
  p,
} from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import { DbConnSql } from "gamezilla/app/@SHARED/server";
import {
  SpaceMsg,
  SpaceReqCtx,
  SpaceServerCtx,
} from "gamezilla/app/space/@SHARED";
import { ChessGameMsg } from "../@SHARED/chess/chess-shared";
import { EloRating } from "./elo-rating";
import { PuzzleDb } from "./puzzle-db";
import {
  PuzzleInteraction,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initShared,
  transitionLoadingToStarted,
  updateCore,
} from "./puzzle.core";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = ({
  ctx,
}: {
  broadcast: (m: ToClient) => Cmd;
  ctx: SpaceServerCtx;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: {
      ...initShared,
      requests: {},
    },
    cmd: async (dispatch) => {
      const result = await initialLoad({
        dbConn: ctx.mySql,
        userId: ctx.hostId,
      });
      dispatch({ t: "db-got-initial-load", result });
    },
  };
};

const initialLoad = async ({
  dbConn,
  userId,
}: {
  dbConn: DbConnSql;
  userId: UserId;
}) => {
  const found = await PuzzleDb.profiles.findElseInsert(dbConn, {
    userId,
    eloRating: EloRating.initialRating,
    puzzleQuery: { ratingRange: [1200, 1500] },
  });

  if (found.t === "err") {
    return found;
  }

  const profile = found.value;

  if (!profile) {
    return Err("Initial load failed. No profile found.");
  }

  const foundPuzzles = await PuzzleDb.puzzles.findForProfile(dbConn, {
    profile,
  });

  if (foundPuzzles.t === "err") {
    return foundPuzzles;
  }

  const puzzles = foundPuzzles.value;

  return Ok({ profile, puzzles });
};

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = (input: {
  msg: Msg;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
  ctx: SpaceServerCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return p(
    update_(input),
    andThen((model) =>
      watchPutInteraction({ ctx: input.ctx, modelPrev: input.model, model })
    )
  );
};
const update_ = ({
  msg,
  model,
  broadcast,
  ctx,
}: {
  msg: Msg;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
  ctx: SpaceServerCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "clock-tick") {
    return {
      model,
      cmd: broadcast({ t: "clock-tick", now: ctx.now }),
    };
  }

  if (msg.t === "db-got-puzzles") {
    if (msg.result.t === "err") {
      return {
        model: {
          ...model,
          requests: { ...model.requests, getPuzzles: msg.result },
        },
        cmd: broadcast({ t: "db-got-puzzles", result: msg.result }),
      };
    }

    const modelNew = transitionLoadingToStarted({
      ctx,
      model: {
        ...model,
        queue: msg.result.value,
      },
    });

    return {
      model: {
        ...modelNew,
        requests: { ...model.requests, getPuzzles: Ok(null) },
      },
      cmd: broadcast({ t: "db-got-puzzles", result: Ok(modelNew) }),
    };
  }

  if (msg.t === "db-got-initial-load") {
    if (msg.result.t === "err") {
      return {
        model,
        cmd: broadcast({ t: "db-got-initial-load", result: msg.result }),
      };
    }

    const { profile, puzzles } = msg.result.value;

    const puzzle = puzzles[0];

    if (!puzzle) {
      return {
        model,
        cmd: broadcast({
          t: "db-got-initial-load",
          result: Err("No puzzles found."),
        }),
      };
    }

    const modelNew: Model = {
      ...model,
      t: "started",
      moves: [],
      profile,
      puzzle,
      queue: puzzles.slice(1),
      startedAt: ctx.now,
    };

    return {
      model: modelNew,
      cmd: broadcast({ t: "db-got-initial-load", result: Ok(modelNew) }),
    };
  }

  if (msg.t === "db-put-interaction") {
    return {
      model,
      cmd: broadcast({
        t: "db-put-interaction",
        result: Result.mapOk(msg.result, () => model),
      }),
    };
  }

  if (msg.t === "db-put-profile") {
    return {
      model,
      cmd: broadcast({
        t: "db-put-profile",
        result: Result.mapOk(msg.result, () => model),
      }),
    };
  }

  return { model };
};

export const updateFromClient = (input: {
  ctx: SpaceReqCtx;
  msg: ToServer;
  model: Model;
  sendToClient: (m: ToClient) => Cmd;
  broadcast: (m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return p(
    input,
    andThen((model) => updateFromClient_({ ...input, model })),
    andThen((model) =>
      watchPutInteraction({ ...input, modelPrev: input.model, model })
    ),
    andThen((model) =>
      watchPutProfile({ ...input, modelPrev: input.model, model })
    ),
    andThen((model) =>
      watchGetPuzzles({ ...input, modelPrev: input.model, model })
    )
  );
};

const watchPutInteraction = ({
  modelPrev,
  model,
  ctx,
}: {
  modelPrev: Model;
  model: Model;
  ctx: SpaceServerCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (model.t === modelPrev.t) {
    return { model };
  }

  if (
    model.t === "started" ||
    model.t === "solved" ||
    model.t === "incorrect" ||
    model.t === "solved-with-hint"
  ) {
    const interaction: PuzzleInteraction = {
      puzzleId: model.puzzle.puzzleId,
      userId: ctx.hostId,
      type: model.t,
    };
    return {
      model,
      cmd: async (dispatch) => {
        const result = await PuzzleDb.interactions.insert(ctx.mySql, [
          interaction,
        ]);
        dispatch({ t: "db-put-interaction", result });
      },
    };
  }

  return { model };
};

const watchGetPuzzles = ({
  model,
  ctx,
}: {
  model: Model;
  modelPrev: Model;
  ctx: SpaceServerCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (
    model.t !== "loading" &&
    model.requests.getPuzzles?.t !== "loading" &&
    model.queue.length === 0
  ) {
    return {
      model: {
        ...model,
        requests: {
          ...model.requests,
          getPuzzles: { t: "loading" },
        },
      },
      cmd: async (dispatch) => {
        const result = await PuzzleDb.puzzles.findForProfile(ctx.mySql, {
          profile: model.profile,
          omit: [model.puzzle.puzzleId, ...model.queue.map((x) => x.puzzleId)],
        });
        dispatch({ t: "db-got-puzzles", result });
      },
    };
  }

  return { model };
};

const watchPutProfile = ({
  model,
  modelPrev,
  ctx,
}: {
  model: Model;
  modelPrev: Model;
  ctx: SpaceServerCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (model.profile && !eq(model.profile, modelPrev.profile)) {
    const profile = model.profile;
    return {
      model,
      cmd: async (dispatch) => {
        const result = await PuzzleDb.profiles.update(ctx.mySql, profile);
        dispatch({ t: "db-put-profile", result });
      },
    };
  }
  return { model };
};

const updateFromClient_: typeof updateFromClient = ({
  msg,
  model,
  broadcast,
  ctx,
}) => {
  const handled = updateCore({ ctx, msg, model });

  return {
    model: handled.t === "ok" ? { ...model, ...handled.value } : model,
    cmd: broadcast({ ...msg, result: handled }),
  };
};

export const updateFromGame = ({
  model,
}: {
  msg: ChessGameMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  return { model };
};

export const updateFromEvent = ({
  model,
}: {
  msg: SpaceMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  return { model };
};

//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  if (model.t === "started") {
    return Time.every(intervalId, 500, () => ({ t: "clock-tick" }));
  }
  return Sub.None;
};
