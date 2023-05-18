import { UserId } from '@gamezilla/shared/app';
import { RoomRequestCtx } from '@gamezilla/shared/backend';
import { Cmd, Result, Sub } from '@gamezilla/shared/core';
import { RoomMsg } from '@gamezilla/shared/frontend';
import {
  ServerModel,
  ServerMsg,
  ToBackend,
  ToFrontend,
} from './tic-tac-toe.types';
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

export type Model = ServerModel;

export const init: Model = { t: 'none' };

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (msg: ToFrontend) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.update(
      { broadcast: (c) => broadcast({ t: 'vs-user', c }) },
      msg.c,
      model.c
    );
    return {
      model: { t: 'vs-user', c: updated[0] },
      cmd: Cmd.tag_('vs-user', updated[1]),
    };
  }

  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.update(
      { broadcast: (c) => broadcast({ t: 'vs-bot', c }) },
      msg.c,
      model.c
    );
    return {
      model: { t: 'vs-bot', c: updated[0] },
      cmd: Cmd.tag_('vs-bot', updated[1]),
    };
  }

  return { model };
};

export const updateFromClient = ({
  sendToClient,
  broadcast,
  msg,
  model,
  ctx,
}: {
  sendToClient: (msg: ToFrontend) => Cmd;
  broadcast: (msg: ToFrontend) => Cmd;
  ctx: RoomRequestCtx;
  msg: ToBackend;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  if (msg.t === 'input-mode') {
    if (ctx.currentUserId !== ctx.hostId) {
      return {
        model,
        cmd: sendToClient({ ...msg, result: Err('must-be-host') }),
      };
    }

    const modelNew: ServerModel = initMode({
      mode: msg.mode,
      userId: ctx.hostId,
    });

    return {
      model: modelNew,
      cmd: broadcast({ ...msg, result: Ok(modelNew) }),
    };
  }

  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.updateFromClient(
      {
        sendToClient: (c) => sendToClient({ t: 'vs-user', c }),
        broadcast: (c) => broadcast({ t: 'vs-user', c }),
      },
      msg.c,
      model.c
    );

    return {
      model: { ...model, c: updated[0] },
      cmd: Cmd.tag_('vs-user', updated[1]),
    };
  }

  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.updateFromClient(
      {
        sendToClient: (c) => sendToClient({ t: 'vs-bot', c }),
        broadcast: (c) => broadcast({ t: 'vs-bot', c }),
      },
      msg.c,
      model.c
    );

    return {
      model: { ...model, c: updated[0] },
      cmd: Cmd.tag_('vs-bot', updated[1]),
    };
  }

  return { model };
};

export const updateFromRoom = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (m: ToFrontend) => Cmd;
  model: Model;
  msg: RoomMsg;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (model.t === 'none') {
    return { model };
  }

  if (model.t === 'vs-bot') {
    const updated = VsBot.updateFromRoom({
      broadcast: (c) => broadcast({ t: 'vs-bot', c }),
      msg,
      model: model.c,
    });
    return {
      model: { t: 'vs-bot', c: updated.model },
      cmd: updated.cmd ? Cmd.tag_('vs-bot', updated.cmd) : undefined,
    };
  }

  if (model.t === 'vs-user') {
    const updated = VsUser.updateFromRoom({
      broadcast: (c) => broadcast({ t: 'vs-user', c }),
      msg,
      model: model.c,
    });
    return {
      model: { t: 'vs-user', c: updated.model },
      cmd: updated.cmd ? Cmd.tag_('vs-user', updated.cmd) : undefined,
    };
  }

  return { model };
};

const initMode = ({
  mode,
  userId,
}: {
  mode: ServerModel['t'];
  userId: UserId;
}): ServerModel => {
  if (mode === 'none') {
    return { t: 'none' };
  }

  if (mode === 'vs-user') {
    return {
      t: 'vs-user',
      c: VsUser.init({ X: userId, O: 'none' }),
    };
  }

  if (mode === 'vs-bot') {
    return {
      t: 'vs-bot',
      c: VsBot.init({ userId }),
    };
  }

  return { t: 'none' };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  if (model.t === 'vs-user') {
    return Sub.tag_('vs-user', VsUser.subscriptions(intervalId, model.c));
  }

  if (model.t === 'vs-bot') {
    return Sub.tag_('vs-bot', VsBot.subscriptions(model.c));
  }

  return Sub.None;
};
