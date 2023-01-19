import { Result, Cmd, exhaustive, Sub } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import {
  BackendModel,
  BackendMsg,
  InputMode_Done,
  ToBackend,
  ToFrontend,
} from './chess-.types';
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

export const update = (
  { broadcast }: { broadcast: (msg: ToFrontend) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
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

    default: {
      return exhaustive(model[0]);
    }
  }
};

export const updateFromFrontend = (
  {
    hostId,
    sendToClient,
    broadcast,
  }: {
    hostId: UserId;
    sendToClient: (msg: ToFrontend) => Cmd;
    broadcast: (msg: ToFrontend) => Cmd;
  },
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'input-mode': {
      const result = initMode({
        hostId,
        mode: msg[1].mode,
        userId: msg[1].userId,
      });

      if (result.type === 'Err') {
        return [model, sendToClient(['input-mode-done', msg[1], result])];
      }

      return [result.value, broadcast(['input-mode-done', msg[1], result])];
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
  }
};

export const updateRoomLeave = (
  { broadcast }: { broadcast: (msg: ToFrontend) => Cmd },
  userId: UserId,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (model[0]) {
    case 'none': {
      return [model, Cmd.None];
    }

    case 'vs-bot': {
      const [child, cmd] = VsBot.updateRoomLeave(
        { broadcast: (msg) => broadcast(['vs-bot', msg]) },
        userId,
        model[1]
      );
      return [['vs-bot', child], Cmd.tag('vs-bot', cmd)];
    }

    case 'vs-user': {
      const [child, cmd] = VsUser.updateRoomLeave(
        { broadcast: (msg) => broadcast(['vs-user', msg]) },
        userId,
        model[1]
      );
      return [['vs-user', child], Cmd.tag('vs-user', cmd)];
    }
  }
};

const initMode = ({
  hostId,
  mode,
  userId,
}: {
  hostId: UserId;
  mode: BackendModel[0];
  userId: UserId;
}): InputMode_Done[2] => {
  if (hostId !== userId) {
    return Err('must_be_the_host');
  }

  switch (mode) {
    case 'none': {
      const modelNew: BackendModel = ['none'];

      return Ok(modelNew);
    }

    case 'vs-bot': {
      const modelNew: BackendModel = ['vs-bot', VsBot.init({ userId: userId })];

      return Ok(modelNew);
    }

    case 'vs-user': {
      const modelNew: BackendModel = [
        'vs-user',
        VsUser.init({ userId: userId }),
      ];

      return Ok(modelNew);
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
  }
};
