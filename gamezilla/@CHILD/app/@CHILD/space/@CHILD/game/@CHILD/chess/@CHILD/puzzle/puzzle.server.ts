import {
  Eff,
  err,
  ok,
  Result,
  Sub,
  Time,
  andThen,
  eq,
  p,
} from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import {
  SpaceServerEvt,
  SpaceReqCtx,
  SpaceServerCmd,
  SpaceServerCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { ChessGameMsg } from "../../@SHARED/chess/chess-shared";
import { EloRating } from "./elo-rating";
import { PuzzleDb } from "./puzzle-db";
import {
  PuzzleInteraction,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initCore,
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

export const init = ({
  ctx,
}: {
  ctx: SpaceServerCtx;
}): {
  model: ServerModel;
  eff: Eff<ServerMsg>;
} => {
  return {
    model: {
      ...initCore,
      requests: {},
    },
    eff: async (dispatch) => {
      const result = await initialLoad({
        dbConn: ctx.dbConn,
        userId: ctx.space.hostId,
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
    return err("Initial load failed. No profile found.");
  }

  const foundPuzzles = await PuzzleDb.puzzles.findForProfile(dbConn, {
    profile,
  });

  if (foundPuzzles.t === "err") {
    return foundPuzzles;
  }

  const puzzles = foundPuzzles.value;

  return ok({ profile, puzzles });
};

//
//
//
// Update
//
//
//

export const update = (input: {
  msg: ServerMsg;
  model: ServerModel;
  ctx: SpaceServerCtx;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  return p(
    updateMain(input),
    andThen((model) =>
      watchPutInteraction({ ctx: input.ctx, modelPrev: input.model, model })
    )
  );
};
const updateMain: typeof update = ({ msg, model, ctx }) => {
  switch (msg.t) {
    case "clock-tick": {
      return {
        model,
        cmd: [{ t: "send-to-space", msg: { t: "clock-tick", now: ctx.now } }],
      };
    }

    case "db-got-puzzles": {
      if (msg.result.t === "err") {
        return {
          model: {
            ...model,
            requests: { ...model.requests, getPuzzles: msg.result },
          },
          cmd: [
            {
              t: "send-to-space",
              msg: { t: "db-got-puzzles", result: msg.result },
            },
          ],
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
          requests: { ...model.requests, getPuzzles: ok(null) },
        },
        cmd: [
          {
            t: "send-to-space",
            msg: { t: "db-got-puzzles", result: ok(modelNew) },
          },
        ],
      };
    }

    case "db-got-initial-load": {
      if (msg.result.t === "err") {
        return {
          model,
          cmd: [
            {
              t: "send-to-space",
              msg: { t: "db-got-initial-load", result: msg.result },
            },
          ],
        };
      }

      const { profile, puzzles } = msg.result.value;

      const puzzle = puzzles[0];

      if (!puzzle) {
        return {
          model,
          cmd: [
            {
              t: "send-to-space",
              msg: {
                t: "db-got-initial-load",
                result: err("No puzzles found."),
              },
            },
          ],
        };
      }

      const modelNew: ServerModel = {
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
        cmd: [
          {
            t: "send-to-space",
            msg: { t: "db-got-initial-load", result: ok(modelNew) },
          },
        ],
      };
    }

    case "db-put-interaction": {
      return {
        model,
        cmd: [
          {
            t: "send-to-space",
            msg: {
              t: "db-put-interaction",
              result: Result.mapOk(msg.result, () => model),
            },
          },
        ],
      };
    }

    case "db-put-profile": {
      return {
        model,
        cmd: [
          {
            t: "send-to-space",
            msg: {
              t: "db-put-profile",
              result: Result.mapOk(msg.result, () => model),
            },
          },
        ],
      };
    }

    case "db-got-profile": {
      return { model };
    }
  }
};

export const updateFromClient = (input: {
  ctx: SpaceReqCtx;
  msg: ToServer;
  model: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  return p(
    input,
    andThen((model) => updateFromClientMain({ ...input, model })),
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
  modelPrev: ServerModel;
  model: ServerModel;
  ctx: SpaceServerCtx;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
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
      userId: ctx.space.hostId,
      type: model.t,
    };
    return {
      model,
      eff: async (dispatch) => {
        const result = await PuzzleDb.interactions.insert(ctx.dbConn, [
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
  model: ServerModel;
  modelPrev: ServerModel;
  ctx: SpaceServerCtx;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
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
      eff: async (dispatch) => {
        const result = await PuzzleDb.puzzles.findForProfile(ctx.dbConn, {
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
  model: ServerModel;
  modelPrev: ServerModel;
  ctx: SpaceServerCtx;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
} => {
  if (model.profile && !eq(model.profile, modelPrev.profile)) {
    const profile = model.profile;
    return {
      model,
      eff: async (dispatch) => {
        const result = await PuzzleDb.profiles.update(ctx.dbConn, profile);
        dispatch({ t: "db-put-profile", result });
      },
    };
  }
  return { model };
};

const updateFromClientMain: typeof updateFromClient = ({ msg, model, ctx }) => {
  const handled = updateCore({ ctx, msg, model });

  return {
    model: handled.t === "ok" ? { ...model, ...handled.value } : model,
    cmd: [{ t: "send-to-space", msg: { ...msg, result: handled } }],
  };
};

export const updateFromGame = ({
  model,
}: {
  msg: ChessGameMsg;
  model: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff;
} => {
  return { model };
};

export const updateFromEvent = ({
  model,
}: {
  msg: SpaceServerEvt;
  model: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff;
} => {
  return { model };
};

//
//
// Subscriptions
//
//
//

const TICK_RATE = 500;

export const subscriptions = (
  intervalId: string,
  model: ServerModel
): Sub<ServerMsg> => {
  switch (model.t) {
    case "started": {
      return Time.every(intervalId, TICK_RATE, () => ({ t: "clock-tick" }));
    }
    default: {
      return Sub.None;
    }
  }
};
