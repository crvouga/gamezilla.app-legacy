import { RoomMsg } from "@gamezilla/shared/client";
import {
  Cmd,
  Ok,
  Result,
  Sub,
  Time,
  andThen,
  eq,
  p,
} from "@gamezilla/shared/core";
import { RoomCtx, RoomRequestCtx } from "@gamezilla/shared/server";
import { GameMsg } from "../chess-shared";
import { EloRating } from "./elo-rating";
import { PuzzleDatabase } from "./puzzle-db";
import {
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  handle,
  initQuery,
  initShared,
  toStatus,
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
  const fetchPuzzles = p(
    PuzzleDatabase.findWhereNoInteractions(ctx.mySql, {
      ...(initShared.puzzleProfile?.query ?? initQuery),
      userId: ctx.hostId,
    }),
    Cmd.perform((result): Msg => ({ t: "got-puzzles", result }))
  );

  const findProfile = p(
    PuzzleDatabase.findElseInsertProfile(ctx.mySql, {
      userId: ctx.hostId,
      eloRating: EloRating.initialRating,
      query: initQuery,
    }),
    Cmd.perform((result): Msg => ({ t: "got-profile", result }))
  );

  return {
    model: initShared,
    cmd: Cmd.batch([fetchPuzzles, findProfile]),
  };
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
        puzzles,
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
      watchGetMorePuzzles({ ...input, modelPrev: input.model, model })
    ),
    andThen(({ model }) =>
      watchPuzzleCompleted({ ...input, modelPrev: input.model, model })
    )
  );
};

const watchPuzzleCompleted = ({
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
  const statusPrev = toStatus(modelPrev);
  const status = toStatus(model);
  if (statusPrev.type === status.type) {
    return { model };
  }

  if (status.type === "incorrect" || status.type === "solved") {
    return {
      model,
      cmd: p(
        PuzzleDatabase.insertManyInteractions(ctx.mySql, [
          {
            puzzleId: status.puzzle.puzzleId,
            userId: ctx.hostId,
            type: status.type,
          },
        ]),
        Cmd.perform((result): Msg => ({ t: "put-interaction", result }))
      ),
    };
  }

  return { model };
};

const watchGetMorePuzzles = ({
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
    model.puzzleProfile &&
    (!eq(model.puzzleProfile?.query, modelPrev.puzzleProfile?.query) ||
      model.puzzles.length <= 1)
  ) {
    return {
      model,
      cmd: p(
        PuzzleDatabase.findWhereNoInteractions(ctx.mySql, {
          ...model.puzzleProfile.query,
          userId: ctx.hostId,
        }),
        Cmd.perform((result): Msg => ({ t: "got-puzzles", result }))
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
  const status = toStatus(model);

  switch (status.type) {
    case "solving": {
      return Time.every(intervalId, 500, () => ({ t: "clock-tick" }));
    }

    default: {
      return Sub.None;
    }
  }
};
