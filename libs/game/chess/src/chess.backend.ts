import { Cmd, Result, Sub } from '@gamezilla/shared/core';
import { RoomMsg } from '@gamezilla/shared/frontend';
import { RoomCtx, RoomRequestCtx } from '@gamezilla/shared/backend';
import { UserId } from '@gamezilla/shared/app';
import { GameMsg } from './chess-shared';
import {
  ServerModel,
  ServerMsg,
  Res,
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
  ctx,
  msg,
  model,
}: {
  broadcast: (msg: ToFrontend) => Cmd;
  msg: Msg;
  model: Model;
  ctx: RoomCtx;
}): [Model, Cmd<Msg>] => {
  switch (model.t) {
    case 'none': {
      return [model, Cmd.None];
    }

    case 'vs-user': {
      if (msg.t === 'vs-user') {
        const [child, cmd] = VsUser.update(
          { broadcast: (msg) => broadcast({ t: 'vs-user', c: msg }) },
          msg.c,
          model.c
        );

        return [{ t: 'vs-user', c: child }, Cmd.tag_('vs-user', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'vs-bot': {
      if (msg.t === 'vs-bot') {
        const [child, cmd] = VsBot.update(
          { broadcast: (msg) => broadcast({ t: 'vs-bot', c: msg }) },
          msg.c,
          model.c
        );

        return [{ t: 'vs-bot', c: child }, Cmd.tag_('vs-bot', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'puzzle': {
      if (msg.t !== 'puzzle') {
        return [model, Cmd.None];
      }

      const updated = Puzzle.update({
        model: model.c,
        msg: msg.c,
        broadcast: (m) => broadcast({ t: 'puzzle', c: m }),
        ctx,
      });

      return [
        { t: 'puzzle', c: updated.model },
        Cmd.tag_('puzzle', updated.cmd ?? Cmd.None),
      ];
    }
  }
};

export const updateFromClient = ({
  sendToClient,
  broadcast,
  msg,
  model,
  ctx,
}: {
  ctx: RoomRequestCtx;
  sendToClient: (msg: ToFrontend) => Cmd;
  broadcast: (msg: ToFrontend) => Cmd;
  msg: ToBackend;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg.t) {
    case 'input-mode': {
      const { result, cmd } = initMode({
        ctx,
        broadcast,
        mode: msg.mode,
        userId: msg.userId,
      });

      if (result.type === 'Err') {
        return [model, Cmd.batch([cmd, sendToClient({ ...msg, result })])];
      }

      const updated = updateFromGame({
        msg: { t: 'mode-changed', mode: result.value.t },
        model: result.value,
      });

      return [
        updated.model,
        Cmd.batch([broadcast({ ...msg, result }), updated.cmd, cmd]),
      ];
    }

    case 'vs-bot': {
      if (model.t === 'vs-bot') {
        const [child, cmd] = VsBot.updateFromClient(
          {
            sendToClient: (msg) => sendToClient({ t: 'vs-bot', c: msg }),
            broadcast: (msg) => broadcast({ t: 'vs-bot', c: msg }),
          },
          msg.c,
          model.c
        );

        return [{ t: 'vs-bot', c: child }, Cmd.tag_('vs-bot', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'vs-user': {
      if (model.t === 'vs-user') {
        const [child, cmd] = VsUser.updateFromClient(
          {
            sendToClient: (msg) => sendToClient({ t: 'vs-user', c: msg }),
            broadcast: (msg) => broadcast({ t: 'vs-user', c: msg }),
          },
          msg.c,
          model.c
        );

        return [{ t: 'vs-user', c: child }, Cmd.tag_('vs-user', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'puzzle': {
      if (model.t !== 'puzzle') {
        return [model, Cmd.None];
      }

      const updated = Puzzle.updateFromClient({
        model: model.c,
        msg: msg.c,
        sendToClient: (m) => sendToClient({ t: 'puzzle', c: m }),
        broadcast: (m) => broadcast({ t: 'puzzle', c: m }),
        ctx,
      });

      return [
        { t: 'puzzle', c: updated.model },
        Cmd.tag_('puzzle', updated.cmd ?? Cmd.None),
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
  switch (model.t) {
    case 'none': {
      return { model };
    }

    case 'vs-bot': {
      const updated = VsBot.updateFromRoom({
        broadcast: (m) => broadcast({ t: 'vs-bot', c: m }),
        msg,
        model: model.c,
      });
      return {
        model: { t: 'vs-bot', c: updated.model },
        cmd: Cmd.tag_('vs-bot', updated.cmd ?? Cmd.None),
      };
    }

    case 'vs-user': {
      const updated = VsUser.updateFromRoom({
        broadcast: (m) => broadcast({ t: 'vs-user', c: m }),
        msg,
        model: model.c,
      });
      return {
        model: { t: 'vs-user', c: updated.model },
        cmd: Cmd.tag_('vs-user', updated.cmd ?? Cmd.None),
      };
    }

    case 'puzzle': {
      const updated = Puzzle.updateFromRoom({
        model: model.c,
        msg,
      });

      return {
        model: { t: 'puzzle', c: updated.model },
        cmd: Cmd.tag_('puzzle', updated.cmd ?? Cmd.None),
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
  switch (model.t) {
    case 'none': {
      return { model };
    }

    case 'puzzle': {
      const updated = Puzzle.updateFromGame({
        model: model.c,
        msg,
      });

      return {
        model: { t: 'puzzle', c: updated.model },
        cmd: Cmd.tag_('puzzle', updated.cmd ?? Cmd.None),
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
  mode,
  userId,
  broadcast,
  ctx,
}: {
  ctx: RoomRequestCtx;
  broadcast: (m: ToFrontend) => Cmd;
  mode: ServerModel['t'];
  userId: UserId;
}): { result: Res['result']; cmd?: Cmd<Msg> } => {
  if (ctx.hostId !== userId) {
    return { result: Err('must_be_the_host') };
  }

  switch (mode) {
    case 'none': {
      const modelNew: ServerModel = { t: 'none' };

      return { result: Ok(modelNew) };
    }

    case 'vs-bot': {
      const modelNew: ServerModel = {
        t: 'vs-bot',
        c: VsBot.init({ userId: userId }),
      };

      return { result: Ok(modelNew) };
    }

    case 'vs-user': {
      const modelNew: ServerModel = {
        t: 'vs-user',
        c: VsUser.init({ userId: userId }),
      };

      return { result: Ok(modelNew) };
    }

    case 'puzzle': {
      const initial = Puzzle.init({
        ctx,
        broadcast: (m) => broadcast({ t: 'puzzle', c: m }),
      });

      const modelNew: ServerModel = { t: 'puzzle', c: initial.model };

      return { result: Ok(modelNew), cmd: Cmd.tag_('puzzle', initial.cmd) };
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

    case 'vs-user': {
      return Sub.tag_('vs-user', VsUser.subscriptions(intervalId, model.c));
    }

    case 'vs-bot': {
      return Sub.tag_('vs-bot', VsBot.subscriptions(intervalId, model.c));
    }

    case 'puzzle': {
      return Sub.tag_('puzzle', Puzzle.subscriptions(intervalId, model.c));
    }
  }
};
