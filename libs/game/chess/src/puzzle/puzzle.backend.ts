import { andThen, Cmd, eq, p, Result, Sub, Time } from '@gamezilla/core';
import { RoomMsg } from '@gamezilla/game-shared';
import { RoomCtx, RoomRequestCtx } from '@gamezilla/game-shared/backend';
import { GameMsg } from '../chess-shared';
import { PuzzleDatabase } from './puzzle-database.postgres';
import {
  BackendModel,
  BackendMsg,
  handle,
  initShared,
  ToBackend,
  ToFrontend,
  toStatus,
} from './puzzle.types';

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init = ({
  ctx,
}: {
  broadcast: (m: ToFrontend) => Cmd;
  ctx: RoomRequestCtx;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: initShared,
    cmd: p(
      PuzzleDatabase.findMany({
        dbConn: ctx.dbConn,
        userId: ctx.currentUserId,
        query: initShared.query,
      }),
      Cmd.perform(
        (result): Msg => ({
          t: 'next-done',
          result,
        })
      )
    ),
  };
};

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

export const update = ({
  msg,
  model,
  broadcast,
  ctx,
}: {
  msg: Msg;
  model: Model;
  broadcast: (m: ToFrontend) => Cmd;
  ctx: RoomCtx;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg.t) {
    case 'clock-tick': {
      const modelNew: Model = {
        ...model,
      };
      return {
        model: modelNew,
        cmd: broadcast({ t: 'clock-tick', now: ctx.now }),
      };
    }

    case 'initialize': {
      if (msg.result.type === 'Err') {
        return {
          model,
          cmd: broadcast({ t: 'initialize', result: msg.result }),
        };
      }
      const puzzles = msg.result.value;
      const modelNew: Model = {
        ...model,
        puzzle: puzzles[0] ?? null,
        startedAt: ctx.now,
      };
      return {
        model: modelNew,
        cmd: broadcast({ t: 'initialize', result: Result.Ok(modelNew) }),
      };
    }

    case 'next-done': {
      if (msg.result.type === 'Err') {
        return {
          model,
          cmd: broadcast({ t: 'next-done', result: msg.result }),
        };
      }

      const puzzles = msg.result.value;

      const modelNew: Model = {
        ...model,
        puzzle: puzzles[0] ?? null,
        startedAt: ctx.now,
      };

      return {
        model: modelNew,
        cmd: broadcast({ t: 'next-done', result: Result.Ok(modelNew) }),
      };
    }

    case 'interaction-insert-done': {
      return {
        model,
        cmd: broadcast({
          t: 'interaction-insert-done',
          result: p(
            msg.result,
            Result.map(() => model)
          ),
        }),
      };
    }
  }
};

export const updateFromFrontend = (input: {
  ctx: RoomRequestCtx;
  msg: ToBackend;
  model: Model;
  sendToClient: (m: ToFrontend) => Cmd;
  broadcast: (m: ToFrontend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return p(
    input,
    andThen(({ model }) => updateFromFrontend_({ ...input, model })),
    andThen(({ model }) =>
      updatePuzzleNext({ ...input, modelPrev: input.model, model })
    ),
    andThen(({ model }) =>
      updatePuzzleCompleted({ ...input, modelPrev: input.model, model })
    )
  );
};

const updatePuzzleCompleted = ({
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

  if (!(status.type === 'incorrect' || status.type === 'solved')) {
    return { model };
  }

  return {
    model,
    cmd: p(
      PuzzleDatabase.insertManyInteractions(ctx.dbConn, [
        {
          puzzleId: status.puzzle.puzzleId,
          userId: ctx.hostId,
          type: status.type,
        },
      ]),
      Cmd.perform((result): Msg => ({ t: 'interaction-insert-done', result }))
    ),
  };
};

const updatePuzzleNext = ({
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
  if (!eq(model.query, modelPrev.query)) {
    return {
      model,
      cmd: p(
        PuzzleDatabase.findMany({
          dbConn: ctx.dbConn,
          userId: ctx.hostId,
          query: model.query,
        }),
        Cmd.perform((result): Msg => ({ t: 'next-done', result }))
      ),
    };
  }

  return { model };
};

const updateFromFrontend_: typeof updateFromFrontend = ({
  msg,
  model,
  sendToClient,
  broadcast,
  ctx,
}) => {
  switch (msg.t) {
    case 'initialize': {
      return {
        model,
        cmd: sendToClient({ t: 'initialize', result: Result.Ok(model) }),
      };
    }

    default: {
      const handled = handle({
        ctx,
        msg,
        model,
      });

      return {
        model: handled.type === 'Ok' ? handled.value : model,
        cmd: broadcast({ ...msg, result: handled }),
      };
    }
  }
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
    case 'mode-changed': {
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
    case 'user-left': {
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
    case 'solving': {
      return Time.every(intervalId, 500, () => ({ t: 'clock-tick' }));
    }

    default: {
      return Sub.None;
    }
  }
};
