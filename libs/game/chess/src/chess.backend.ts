import { Cmd, exhaustive, Result, Sub } from '@gamezilla/core';
import { RoomCtx, RoomMsg } from '@gamezilla/game-shared';
import { UserId } from '@gamezilla/shared';
import { DatabaseConnection } from '@gamezilla/shared/backend';
import { GameMsg } from './chess-shared';
import {
  BackendModel,
  BackendMsg,
  InputMode_Done,
  ToBackend,
  ToFrontend,
} from './chess.types';
import * as Puzzle from './puzzle/puzzle.backend';
import * as VsBot from './vs-bot/vs-bot.backend';
import * as VsUser from './vs-user/vs-user.backend';

const { Err, Ok } = Result;

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = ['none'];

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

export const update = ({
  broadcast,
  ctx,
  msg,
  model,
}: {
  broadcast: (msg: ToFrontend) => Cmd;
  msg: Msg;
  model: Model;
  ctx: RoomCtx;
}): [Model, Cmd<Msg>] => {
  switch (model[0]) {
    case 'none': {
      return [model, Cmd.None];
    }

    case 'vs-user': {
      if (msg[0] === 'vs-user') {
        const [child, cmd] = VsUser.update(
          { broadcast: (msg) => broadcast(['vs-user', msg]) },
          msg[1],
          model[1]
        );

        return [['vs-user', child], Cmd.tag('vs-user', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'vs-bot': {
      if (msg[0] === 'vs-bot') {
        const [child, cmd] = VsBot.update(
          { broadcast: (msg) => broadcast(['vs-bot', msg]) },
          msg[1],
          model[1]
        );

        return [['vs-bot', child], Cmd.tag('vs-bot', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'puzzle': {
      if (msg[0] !== 'puzzle') {
        return [model, Cmd.None];
      }

      const updated = Puzzle.update({
        model: model[1],
        msg: msg[1],
        broadcast: (m) => broadcast(['puzzle', m]),
        ctx,
      });

      return [
        ['puzzle', updated.model],
        Cmd.tag('puzzle', updated.cmd ?? Cmd.None),
      ];
    }

    default: {
      return exhaustive(model[0]);
    }
  }
};

export const updateFromFrontend = ({
  sendToClient,
  broadcast,
  msg,
  model,
  dbConn,
  ctx,
}: {
  ctx: RoomCtx;
  sendToClient: (msg: ToFrontend) => Cmd;
  broadcast: (msg: ToFrontend) => Cmd;
  dbConn: DatabaseConnection;
  msg: ToBackend;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'input-mode': {
      const { result, cmd } = initMode({
        dbConn,
        broadcast,
        hostId: ctx.hostId,
        mode: msg[1].mode,
        userId: msg[1].userId,
      });

      if (result.type === 'Err') {
        return [
          model,
          Cmd.batch([cmd, sendToClient(['input-mode-done', msg[1], result])]),
        ];
      }

      const updated = updateFromGame({
        msg: ['mode-changed', result.value[0]],
        model: result.value,
      });

      return [
        updated.model,
        Cmd.batch([
          broadcast(['input-mode-done', msg[1], result]),
          updated.cmd,
          cmd,
        ]),
      ];
    }

    case 'vs-bot': {
      if (model[0] === 'vs-bot') {
        const [child, cmd] = VsBot.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(['vs-bot', msg]),
            broadcast: (msg) => broadcast(['vs-bot', msg]),
          },
          msg[1],
          model[1]
        );

        return [['vs-bot', child], Cmd.tag('vs-bot', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'vs-user': {
      if (model[0] === 'vs-user') {
        const [child, cmd] = VsUser.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(['vs-user', msg]),
            broadcast: (msg) => broadcast(['vs-user', msg]),
          },
          msg[1],
          model[1]
        );

        return [['vs-user', child], Cmd.tag('vs-user', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'puzzle': {
      if (model[0] !== 'puzzle') {
        return [model, Cmd.None];
      }

      const updated = Puzzle.updateFromFrontend({
        model: model[1],
        msg: msg[1],
        dbConn,
        sendToClient: (m) => sendToClient(['puzzle', m]),
        broadcast: (m) => broadcast(['puzzle', m]),
        ctx,
      });

      return [
        ['puzzle', updated.model],
        Cmd.tag('puzzle', updated.cmd ?? Cmd.None),
      ];
    }
  }
};

export const updateFromRoom = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (msg: ToFrontend) => Cmd;
  model: Model;
  msg: RoomMsg;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (model[0]) {
    case 'none': {
      return { model };
    }

    case 'vs-bot': {
      const updated = VsBot.updateFromRoom({
        broadcast: (m) => broadcast(['vs-bot', m]),
        msg,
        model: model[1],
      });
      return {
        model: ['vs-bot', updated.model],
        cmd: Cmd.tag('vs-bot', updated.cmd ?? Cmd.None),
      };
    }

    case 'vs-user': {
      const updated = VsUser.updateFromRoom({
        broadcast: (m) => broadcast(['vs-user', m]),
        msg,
        model: model[1],
      });
      return {
        model: ['vs-user', updated.model],
        cmd: Cmd.tag('vs-user', updated.cmd ?? Cmd.None),
      };
    }

    case 'puzzle': {
      const updated = Puzzle.updateFromRoom({
        model: model[1],
        msg,
      });

      return {
        model: ['puzzle', updated.model],
        cmd: Cmd.tag('puzzle', updated.cmd ?? Cmd.None),
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
  cmd?: Cmd<Msg>;
} => {
  switch (model[0]) {
    case 'none': {
      return { model };
    }

    case 'puzzle': {
      const updated = Puzzle.updateFromGame({
        model: model[1],
        msg,
      });

      return {
        model: ['puzzle', updated.model],
        cmd: Cmd.tag('puzzle', updated.cmd ?? Cmd.None),
      };
    }

    case 'vs-bot': {
      return { model };
    }

    case 'vs-user': {
      return { model };
    }
  }
};

const initMode = ({
  hostId,
  mode,
  userId,
  dbConn,
  broadcast,
}: {
  dbConn: DatabaseConnection;
  broadcast: (m: ToFrontend) => Cmd;
  hostId: UserId;
  mode: BackendModel[0];
  userId: UserId;
}): { result: InputMode_Done[2]; cmd?: Cmd<Msg> } => {
  if (hostId !== userId) {
    return { result: Err('must_be_the_host') };
  }

  switch (mode) {
    case 'none': {
      const modelNew: BackendModel = ['none'];

      return { result: Ok(modelNew) };
    }

    case 'vs-bot': {
      const modelNew: BackendModel = ['vs-bot', VsBot.init({ userId: userId })];

      return { result: Ok(modelNew) };
    }

    case 'vs-user': {
      const modelNew: BackendModel = [
        'vs-user',
        VsUser.init({ userId: userId }),
      ];

      return { result: Ok(modelNew) };
    }

    case 'puzzle': {
      const initial = Puzzle.init({
        dbConn,
        ctx: {
          currentUserId: userId,
        },
        broadcast: (m) => broadcast(['puzzle', m]),
      });

      const modelNew: BackendModel = ['puzzle', initial.model];

      return { result: Ok(modelNew), cmd: Cmd.tag('puzzle', initial.cmd) };
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model[0]) {
    case 'none': {
      return Sub.None;
    }

    case 'vs-user': {
      return Sub.tag('vs-user', VsUser.subscriptions(intervalId, model[1]));
    }

    case 'vs-bot': {
      return Sub.tag('vs-bot', VsBot.subscriptions(intervalId, model[1]));
    }

    case 'puzzle': {
      return Sub.tag('puzzle', Puzzle.subscriptions(intervalId, model[1]));
    }
  }
};
