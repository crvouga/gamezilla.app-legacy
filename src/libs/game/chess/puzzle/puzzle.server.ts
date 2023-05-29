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
  eq,
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
  initShared,
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
      Cmd.perform((result) => ({ t: "db-got-initial-load", result }))
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
      return {
        model,
        cmd: broadcast({ t: "clock-tick", now: ctx.now }),
      };
    }

    case "db-got-puzzles": {
      if (msg.result.t === "err") {
        return {
          model,
          cmd: broadcast({ t: "db-got-puzzles", result: msg.result }),
        };
      }

      const modelNew: Model = {
        ...model,
        queue: msg.result.value,
      };

      return {
        model: modelNew,
        cmd: broadcast({ t: "db-got-puzzles", result: Ok(modelNew) }),
      };
    }

    case "db-got-profile": {
      if (msg.result.t === "err") {
        return {
          model,
          cmd: broadcast({ t: "db-got-profile", result: msg.result }),
        };
      }

      const puzzleProfile = msg.result.value;

      if (!puzzleProfile) {
        return {
          model,
          cmd: broadcast({
            t: "db-got-profile",
            result: Err("No profile found."),
          }),
        };
      }

      const modelNew: Model = {
        ...model,
        profile: puzzleProfile,
      };

      return {
        model: modelNew,
        cmd: broadcast({ t: "db-got-profile", result: Ok(modelNew) }),
      };
    }

    case "db-got-initial-load": {
      if (msg.result.t === "err") {
        return {
          model,
          cmd: broadcast({ t: "db-got-initial-load", result: msg.result }),
        };
      }

      const { puzzleProfile, puzzles } = msg.result.value;

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
        t: "in-progress",
        moves: [],
        profile: puzzleProfile,
        puzzle,
        queue: puzzles.slice(1),
        startedAt: ctx.now,
      };

      return {
        model: modelNew,
        cmd: broadcast({ t: "db-got-initial-load", result: Ok(modelNew) }),
      };
    }

    case "db-put-interaction": {
      return {
        model,
        cmd: broadcast({
          t: "db-put-interaction",
          result: p(
            msg.result,
            Result.map(() => model)
          ),
        }),
      };
    }

    case "db-put-profile": {
      return {
        model,
        cmd: broadcast({
          t: "db-put-profile",
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
      watchEnqueueMorePuzzles({ ...input, modelPrev: input.model, model })
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
  if (
    model.t !== modelPrev.t &&
    (model.t === "solved" ||
      model.t === "incorrect" ||
      model.t === "solved-with-hint")
  ) {
    return {
      model,
      cmd: Cmd.batch([
        p(
          PuzzleDb.insertManyInteractions(ctx.mySql, [
            {
              puzzleId: model.puzzle.puzzleId,
              userId: ctx.hostId,
              type: model.t,
            },
          ]),
          Cmd.perform((result): Msg => ({ t: "db-put-interaction", result }))
        ),
      ]),
    };
  }

  return { model };
};

const watchEnqueueMorePuzzles = ({
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
  if (
    modelPrev.t !== "loading" &&
    model.t !== "loading" &&
    model.queue.length === 0 &&
    modelPrev.queue.length > 0
  ) {
    return {
      model: { t: "loading" },
      cmd: p(
        PuzzleDb.findWithNoInteraction(ctx.mySql, {
          ratingRange: [
            model.profile.eloRating - 100,
            model.profile.eloRating + 100,
          ],
          userId: ctx.hostId,
        }),
        Cmd.perform((result): Msg => ({ t: "db-got-puzzles", result }))
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
  if (model.profile && !eq(model.profile, modelPrev.profile)) {
    return {
      model,
      cmd: p(
        PuzzleDb.updateProfile(ctx.mySql, model.profile),
        Cmd.perform((result): Msg => ({ t: "db-put-profile", result }))
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
  model,
}: {
  msg: GameMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  return { model };
};

export const updateFromRoom = ({
  model,
}: {
  msg: RoomMsg;
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

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  if (model.t === "in-progress") {
    return Time.every(intervalId, 500, () => ({ t: "clock-tick" }));
  }
  return Sub.None;
};
