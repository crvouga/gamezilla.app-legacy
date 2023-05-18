import { andThen, Cmd, eq, p, Result, Sub, Time } from '@gamezilla/shared/core';
import { RoomMsg } from '@gamezilla/shared/client';
import { RoomCtx, RoomRequestCtx } from '@gamezilla/shared/server';
import { GameMsg } from '../chess-shared';
import { PuzzleDatabase } from './puzzle-db';
import {
  ServerModel,
  ServerMsg,
  handle,
  initShared,
  ToServer,
  ToClient,
  toStatus,
} from './puzzle.shared';

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
  ctx: RoomRequestCtx;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: initShared,
    cmd: p(
      PuzzleDatabase.fetchNeverSeen(ctx.mySql, {
        ...initShared.query,
        userId: ctx.currentUserId,
      }),
      Cmd.perform((result): Msg => ({ t: 'fetched-puzzles', result }))
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
    case 'clock-tick': {
      const modelNew: Model = {
        ...model,
      };
      return {
        model: modelNew,
        cmd: broadcast({ t: 'clock-tick', now: ctx.now }),
      };
    }

    case 'fetched-puzzles': {
      if (msg.result.type === 'Err') {
        return {
          model,
          cmd: broadcast({ t: 'fetched-puzzles', result: msg.result }),
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
        cmd: broadcast({ t: 'fetched-puzzles', result: Result.Ok(modelNew) }),
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
      updateFetchMore({ ...input, modelPrev: input.model, model })
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

  if (status.type !== 'incorrect' && status.type !== 'solved') {
    return { model };
  }

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
      Cmd.perform((result): Msg => ({ t: 'interaction-insert-done', result }))
    ),
  };
};

const updateFetchMore = ({
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
  if (!eq(model.query, modelPrev.query) || model.puzzles.length <= 1) {
    return {
      model,
      cmd: p(
        PuzzleDatabase.fetchNeverSeen(ctx.mySql, {
          ...model.query,
          userId: ctx.hostId,
        }),
        Cmd.perform((result): Msg => ({ t: 'fetched-puzzles', result }))
      ),
    };
  }

  return { model };
};

const updateFromClient_: typeof updateFromClient = ({
  msg,
  model,
  // sendToClient,
  broadcast,
  ctx,
}) => {
  switch (msg.t) {
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
