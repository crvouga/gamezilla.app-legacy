import { Cmd, p, Result, Sub } from '@gamezilla/core';
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
  Res,
  ToBackend,
  ToFrontend,
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
}): { model: Model; cmd: Cmd<Msg> } => {
  return {
    model: initShared,
    cmd: p(
      PuzzleDatabase.findNext({ dbConn, query: initShared.query }),
      Cmd.perform((result) => ['initialize', result])
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
        puzzle: puzzles[0],
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
        puzzle: puzzles[0],
      };

      return {
        model: modelNew,
        cmd: broadcast(['next-puzzle-done', Result.Ok(modelNew)]),
      };
    }
  }
};

export const updateFromFrontend = ({
  msg,
  model,
  sendToClient,
  broadcast,
  ctx,
  dbConn,
}: {
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
  switch (msg[0]) {
    case 'initialize': {
      return {
        model,
        cmd: sendToClient(['initialize', Result.Ok(model)]),
      };
    }

    case 'next-puzzle': {
      const handled = handle({
        ctx,
        msg,
        model,
      });

      const modelNew = handled.type === 'Ok' ? handled.value : model;
      const res: Res = [msg[0], handled];

      return {
        model: modelNew,
        cmd: Cmd.batch([
          broadcast(res),
          p(
            PuzzleDatabase.findNext({ dbConn, query: modelNew.query }),
            Cmd.perform((result) => ['next-puzzle-done', result])
          ),
        ]),
      };
    }

    case 'retry-puzzle':
    case 'input-move': {
      const handled = handle({
        ctx,
        msg,
        model,
      });

      const modelNew = handled.type === 'Ok' ? handled.value : model;
      const res: Res = [msg[0], handled];

      return {
        model: modelNew,
        cmd: broadcast(res),
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
