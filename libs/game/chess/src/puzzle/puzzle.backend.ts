import { andThen, Cmd, eq, p, Result, Sub } from '@gamezilla/core';
import { SharedMsg } from '@gamezilla/game-shared';
import { UserId } from '@gamezilla/shared';
import { DatabaseConnection } from '@gamezilla/shared/backend';
import { GameMsg } from '../chess-shared';
import { PuzzleDatabase } from './puzzle-database';
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
  dbConn,
}: {
  dbConn: DatabaseConnection;
  broadcast: (m: ToFrontend) => Cmd;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: initShared,
    cmd: p(
      PuzzleDatabase.findNext({ dbConn, query: initShared.query }),
      Cmd.perform((result): Msg => ['next-puzzle-done', result])
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
}: {
  msg: Msg;
  model: Model;
  broadcast: (m: ToFrontend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg[0]) {
    case 'initialize': {
      if (msg[1].type === 'Err') {
        return { model, cmd: broadcast(['initialize', msg[1]]) };
      }
      const puzzles = msg[1].value;
      const modelNew: Model = {
        ...model,
        puzzle: puzzles[0] ?? null,
      };
      return {
        model: modelNew,
        cmd: broadcast(['initialize', Result.Ok(modelNew)]),
      };
    }

    case 'next-puzzle-done': {
      if (msg[1].type === 'Err') {
        return { model, cmd: broadcast(['next-puzzle-done', msg[1]]) };
      }

      const puzzles = msg[1].value;

      const modelNew: Model = {
        ...model,
        puzzle: puzzles[0] ?? null,
      };

      return {
        model: modelNew,
        cmd: broadcast(['next-puzzle-done', Result.Ok(modelNew)]),
      };
    }
  }
};

export const updateFromFrontend = (input: {
  ctx: { currentUserId: UserId; hostId: UserId };
  msg: ToBackend;
  model: Model;
  dbConn: DatabaseConnection;
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
      updateNextPuzzle({ ...input, modelPrev: input.model, model })
    )
  );
};

const updateNextPuzzle = ({
  model,
  modelPrev,
  dbConn,
}: {
  model: Model;
  modelPrev: Model;
  dbConn: DatabaseConnection;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (!eq(model.query, modelPrev.query)) {
    return {
      model,
      cmd: p(
        PuzzleDatabase.findNext({
          dbConn,
          query: modelPrev.query,
        }),
        Cmd.perform((result): Msg => ['next-puzzle-done', result])
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
  switch (msg[0]) {
    case 'initialize': {
      return {
        model,
        cmd: sendToClient(['initialize', Result.Ok(model)]),
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
        cmd: broadcast([msg[0], handled]),
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
  switch (msg[0]) {
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
  msg: SharedMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg[0]) {
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

export const subscriptions = (_intervalId: string, _model: Model): Sub<Msg> => {
  return Sub.None;
};
