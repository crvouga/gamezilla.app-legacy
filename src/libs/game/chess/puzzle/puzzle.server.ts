import { UserId } from "@gamezilla/shared/app";
import { RoomMsg } from "@gamezilla/shared/client";
import {
  Cmd,
  Err,
  Ok,
  Result,
  Sub,
  Time,
  andThen,
  p,
} from "@gamezilla/shared/core";
import { DbConnMySql, RoomCtx, RoomRequestCtx } from "@gamezilla/shared/server";
import { GameMsg } from "../chess-shared";
import { PuzzleDb } from "./puzzle-db";
import {
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  handle,
  initQuery,
  initShared,
  toState,
} from "./puzzle.shared";

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
  ctx: RoomCtx;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: initShared,
    cmd: p(
      initialLoad(ctx.mySql, { userId: ctx.hostId }),
      Cmd.perform((result) => ({ t: "got-initial-load", result }))
    ),
  };
};

const initialLoad =
  (dbConn: DbConnMySql, { userId }: { userId: UserId }) =>
  async () => {
    const found = await PuzzleDb.findProfile(dbConn, userId)();
    if (found.t === "err") {
      return found;
    }
    const puzzleProfile = found.value;

    if (!puzzleProfile) {
      return Err("Initial load failed. No profile found.");
    }

    const foundPuzzles = await PuzzleDb.findWithNoInteraction(dbConn, {
      ratingRange: [
        puzzleProfile.eloRating - 100,
        puzzleProfile.eloRating + 100,
      ],
      userId,
    })();

    if (foundPuzzles.t === "err") {
      return foundPuzzles;
    }

    const puzzles = foundPuzzles.value;

    return Ok({
      puzzleProfile,
      puzzles,
    });
  };

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  msg,
  model,
  broadcast,
  ctx,
}: {
  msg: Msg;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
  ctx: RoomCtx;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg.t) {
    case "clock-tick": {
      const modelNew: Model = {
        ...model,
      };
      return {
        model: modelNew,
        cmd: broadcast({ t: "clock-tick", now: ctx.now }),
      };
    }

    case "got-puzzles": {
      if (msg.result.t === "err") {
        return {
          model,
          cmd: broadcast({ t: "got-puzzles", result: msg.result }),
        };
      }

      const puzzles = msg.result.value;

      const modelNew: Model = {
        ...model,
        puzzles: [...model.puzzles, ...puzzles],
        startedAt: ctx.now,
      };

      return {
        model: modelNew,
        cmd: broadcast({ t: "got-puzzles", result: Ok(modelNew) }),
      };
    }

    case "got-profile": {
      if (msg.result.t === "err") {
        return {
          model,
          cmd: broadcast({ t: "got-profile", result: msg.result }),
        };
      }

      const puzzleProfile = msg.result.value;

      const modelNew: Model = {
        ...model,
        puzzleProfile,
      };

      return {
        model: modelNew,
        cmd: broadcast({ t: "got-profile", result: Ok(modelNew) }),
      };
    }

    case "got-initial-load": {
      if (msg.result.t === "err") {
        return {
          model,
          cmd: broadcast({ t: "got-initial-load", result: msg.result }),
        };
      }

      const { puzzleProfile, puzzles } = msg.result.value;

      const modelNew: Model = {
        ...model,
        puzzleProfile,
        puzzles,
        startedAt: ctx.now,
      };

      return {
        model: modelNew,
        cmd: broadcast({ t: "got-initial-load", result: Ok(modelNew) }),
      };
    }

    case "put-interaction": {
      return {
        model,
        cmd: broadcast({
          t: "put-interaction",
          result: p(
            msg.result,
            Result.map(() => model)
          ),
        }),
      };
    }

    case "put-profile": {
      return {
        model,
        cmd: broadcast({
          t: "put-profile",
          result: p(
            msg.result,
            Result.map(() => model)
          ),
        }),
      };
    }
  }
};

export const updateFromClient = (input: {
  ctx: RoomRequestCtx;
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
    andThen(({ model }) => updateFromClient_({ ...input, model })),
    andThen(({ model }) =>
      watchLoadMorePuzzles({ ...input, modelPrev: input.model, model })
    ),
    andThen(({ model }) =>
      watchInsertInteraction({ ...input, modelPrev: input.model, model })
    ),
    andThen(({ model }) =>
      watchUpdateProfile({ ...input, modelPrev: input.model, model })
    )
  );
};

const watchInsertInteraction = ({
  modelPrev,
  model,
  ctx,
}: {
  modelPrev: Model;
  model: Model;
  ctx: RoomRequestCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const statusPrev = toState(modelPrev);
  const status = toState(model);
  if (statusPrev.type === status.type) {
    return { model };
  }

  if (status.type === "incorrect" || status.type === "solved") {
    return {
      model,
      cmd: Cmd.batch([
        p(
          PuzzleDb.insertManyInteractions(ctx.mySql, [
            {
              puzzleId: status.puzzle.puzzleId,
              userId: ctx.hostId,
              type: status.type,
            },
          ]),
          Cmd.perform((result): Msg => ({ t: "put-interaction", result }))
        ),
      ]),
    };
  }

  return { model };
};

const watchLoadMorePuzzles = ({
  model,
  // modelPrev,
  ctx,
}: {
  model: Model;
  modelPrev: Model;
  ctx: RoomCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (model.puzzleProfile && model.puzzles.length <= 1) {
    return {
      model,
      cmd: p(
        PuzzleDb.findWithNoInteraction(ctx.mySql, {
          ratingRange: [
            model.puzzleProfile.eloRating - 100,
            model.puzzleProfile.eloRating + 100,
          ],
          userId: ctx.hostId,
        }),
        Cmd.perform((result): Msg => ({ t: "got-puzzles", result }))
      ),
    };
  }

  return { model };
};

const watchUpdateProfile = ({
  model,
  modelPrev,
  ctx,
}: {
  model: Model;
  modelPrev: Model;
  ctx: RoomCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const statusPrev = toState(modelPrev);
  const status = toState(model);

  if (
    statusPrev.type !== status.type &&
    (status.type === "incorrect" || status.type === "solved")
  ) {
    return {
      model,
      cmd: p(
        PuzzleDb.updateProfile(ctx.mySql, {
          userId: ctx.hostId,
          eloRating: status.nextEloRating,
          query: model.puzzleProfile?.query ?? initQuery,
        }),
        Cmd.perform((result): Msg => ({ t: "put-profile", result }))
      ),
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
  const handled = handle({
    ctx,
    msg,
    model,
  });

  return {
    model: handled.t === "ok" ? handled.value : model,
    cmd: broadcast({ ...msg, result: handled }),
  };
};

export const updateFromGame = ({
  msg,
  model,
}: {
  msg: GameMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg.t) {
    case "mode-changed": {
      return {
        model,
        cmd: Cmd.None,
      };
    }
  }
};

export const updateFromRoom = ({
  msg,
  model,
}: {
  msg: RoomMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg.t) {
    case "user-left": {
      return {
        model,
      };
    }
  }
};

//
//
// Subscriptions
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  const status = toState(model);

  switch (status.type) {
    case "solving": {
      return Time.every(intervalId, 500, () => ({ t: "clock-tick" }));
    }

    default: {
      return Sub.None;
    }
  }
};
