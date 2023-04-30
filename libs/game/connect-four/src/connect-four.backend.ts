import { Cmd, Result, Sub } from '@gamezilla/core';
import { RoomMsg } from '@gamezilla/shared';
import { UserId } from '@gamezilla/shared';
import { RoomRequestCtx } from '@gamezilla/shared/backend';
import {
  BackendModel,
  BackendMsg,
  Mode,
  ToBackend,
  ToFrontend,
} from './connect-four.types';
import * as VsBot from './vs-bot/vs-bot.backend';
import * as VsUser from './vs-user/vs-user.backend';

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = { t: 'none' };

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
  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.update({
      broadcast: (c) => broadcast({ t: 'vs-bot', c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: 'vs-bot', c: updated.model },
      cmd: Cmd.tag_('vs-bot', updated.cmd),
    };
  }

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

  return { model };
};

export const updateFromFrontend = ({
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
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-mode') {
    const { mode } = msg;
    const modelNew = initMode(mode, ctx.currentUserId);
    return {
      model: modelNew,
      cmd: broadcast({ ...msg, result: Result.Ok(modelNew) }),
    };
  }

  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.updateFromFrontend(
      {
        sendToClient: (c) => sendToClient({ t: 'vs-bot', c }),
        broadcast: (c) => broadcast({ t: 'vs-bot', c }),
        currentUserId: ctx.currentUserId,
      },
      msg.c,
      model.c
    );

    return {
      model: { t: 'vs-bot', c: updated[0] },
      cmd: Cmd.tag_('vs-bot', updated[1]),
    };
  }

  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.updateFromFrontend(
      {
        sendToClient: (c) => sendToClient({ t: 'vs-user', c }),
        broadcast: (c) => broadcast({ t: 'vs-user', c }),
      },
      msg.c,
      model.c
    );

    return {
      model: { t: 'vs-user', c: updated[0] },
      cmd: Cmd.tag_('vs-user', updated[1]),
    };
  }
  return { model };
};

export const updateFromRoom = ({
  broadcast,
  msg,
  model,
}: {
  msg: RoomMsg;
  model: Model;
  broadcast: (m: ToFrontend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (model.t) {
    case 'none': {
      return { model };
    }

    case 'vs-bot': {
      const updated = VsBot.updateFromRoom({
        msg,
        model: model.c,
        broadcast: (c) => broadcast({ t: 'vs-bot', c }),
      });
      return {
        model: { t: 'vs-bot', c: updated.model },
        cmd: Cmd.tag_('vs-bot', updated.cmd),
      };
    }

    case 'vs-user': {
      const updated = VsUser.updateFromRoom({
        msg,
        model: model.c,
        broadcast: (c) => broadcast({ t: 'vs-user', c }),
      });

      return {
        model: { t: 'vs-user', c: updated.model },
        cmd: Cmd.tag_('vs-user', updated.cmd),
      };
    }
  }
};

const initMode = (mode: Mode, userId: UserId): Model => {
  switch (mode) {
    case 'none': {
      return { t: 'none' };
    }

    case 'vs-bot': {
      return {
        t: 'vs-bot',
        c: VsBot.init({ player: userId }),
      };
    }

    case 'vs-user': {
      return {
        t: 'vs-user',
        c: VsUser.init({ PlayerOne: userId, PlayerTwo: 'none' }),
      };
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
  switch (model.t) {
    case 'none': {
      return Sub.None;
    }

    case 'vs-bot': {
      return Sub.None;
    }

    case 'vs-user': {
      return Sub.tag_('vs-user', VsUser.subscriptions(intervalId, model.c));
    }
  }
};
