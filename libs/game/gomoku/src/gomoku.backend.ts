import { UserId } from '@gamezilla/shared';
import { RoomRequestCtx } from '@gamezilla/shared/backend';
import { Cmd, Result, Sub } from '@gamezilla/shared/core';
import { RoomMsg } from '@gamezilla/shared/frontend';
import {
  BackendModel,
  BackendMsg,
  Mode,
  ToBackend,
  ToFrontend,
} from './gomoku.types';
import * as VsBot from './vs-bot/vs-bot.backend';
import * as VsUser from './vs-user/vs-user.backend';

const { Ok } = Result;

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = {
  t: 'none',
};

const initMode = ({ mode, userId }: { mode: Mode; userId: UserId }): Model => {
  switch (mode) {
    case 'none': {
      return { t: 'none' };
    }

    case 'vs-bot': {
      return {
        t: 'vs-bot',
        c: VsBot.init({ userId }),
      };
    }

    case 'vs-user': {
      return {
        t: 'vs-user',
        c: VsUser.init({ white: userId, black: null }),
      };
    }
  }
};

//
//
//
// update
//
//
//

export type Msg = BackendMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.update({ msg: msg.c, model: model.c });
    return {
      model: { t: 'vs-bot', c: updated.model },
      cmd: Cmd.tag_('vs-bot', updated.cmd),
    };
  }

  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.update({ msg: msg.c, model: model.c });
    return {
      model: { t: 'vs-user', c: updated.model },
      cmd: Cmd.tag_('vs-user', updated.cmd),
    };
  }

  return { model };
};

export const updateFromFrontend = ({
  ctx,
  broadcast,
  sendToClient,
  msg,
  model,
}: {
  ctx: RoomRequestCtx;
  sendToClient: (m: ToFrontend) => Cmd;
  broadcast: (m: ToFrontend) => Cmd;
  msg: ToBackend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-mode') {
    const modelNew = initMode(msg);
    return {
      model: modelNew,
      cmd: broadcast({ ...msg, result: Ok(modelNew) }),
    };
  }

  if (model.t === 'vs-bot' && msg.t === 'vs-bot') {
    const updated = VsBot.updateFromFrontend({
      ctx,
      broadcast: (c) => broadcast({ t: 'vs-bot', c }),
      sendToClient: (c) => sendToClient({ t: 'vs-bot', c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: 'vs-bot', c: updated.model },
      cmd: Cmd.tag_('vs-bot', updated.cmd),
    };
  }

  if (model.t === 'vs-user' && msg.t === 'vs-user') {
    const updated = VsUser.updateFromFrontend({
      msg: msg.c,
      model: model.c,
      ctx,
      broadcast: (c) => broadcast({ t: 'vs-user', c }),
      sendToClient: (c) => sendToClient({ t: 'vs-user', c }),
    });

    return {
      model: { t: 'vs-user', c: updated.model },
      cmd: Cmd.tag_('vs-user', updated.cmd),
    };
  }

  return { model };
};

export const updateFromRoom = ({
  msg,
  model,
}: {
  msg: RoomMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (model.t === 'vs-bot') {
    const updated = VsBot.updateFromRoom({ msg, model: model.c });
    return {
      model: { t: 'vs-bot', c: updated.model },
      cmd: Cmd.tag_('vs-bot', updated.cmd),
    };
  }

  if (model.t === 'vs-user') {
    const updated = VsUser.updateFromRoom({ msg, model: model.c });
    return {
      model: { t: 'vs-user', c: updated.model },
      cmd: Cmd.tag_('vs-user', updated.cmd),
    };
  }

  return {
    model,
  };
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
