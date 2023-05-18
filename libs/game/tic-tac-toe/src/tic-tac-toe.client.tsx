import { Cmd, Sub } from '@gamezilla/shared/core';
import {
  Alerts,
  Ctx,
  RoomCtx,
  RoomViewCtx,
  ViewCtx,
  ViewMainMenu,
} from '@gamezilla/shared/client';
import { IconComputerDesktop, IconUsers } from '@gamezilla/shared/ui';
import {
  ServerModel,
  ClientModel,
  ClientMsg,
  ToServer,
  ToClient,
} from './tic-tac-toe.shared';
import { viewCoverArt } from './tic-tic-toe/tic-tac-toe-ui';
import * as VsBot from './vs-bot/vs-bot.client';
import * as VsUser from './vs-user/vs-user.client';

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: Model = {
  t: 'none',
};

//
//
// Update
//
//
//

export type Msg = ClientMsg;

export type OutAction = Alerts.Action;

export const update = ({
  sendToServer,
  msg,
  model,
  ctx,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  ctx: RoomCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-mode') {
    return { model, cmd: sendToServer(msg) };
  }

  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.update(
      {
        sendToServer: (c) => sendToServer({ t: 'vs-user', c }),
      },
      msg.c,
      model.c
    );
    return {
      model: { t: 'vs-user', c: updated[0] },
      cmd: Cmd.tag_('vs-user', updated[1]),
    };
  }

  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.update({
      ctx,
      sendToServer: (c) => sendToServer({ t: 'vs-bot', c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: 'vs-bot', c: updated.model },
      cmd: Cmd.tag_('vs-bot', updated.cmd),
    };
  }

  return { model };
};

export const updateFromServer = ({
  ctx,
  msg,
  model,
}: {
  ctx: RoomCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
  if (msg.t === 'input-mode') {
    const { result } = msg;

    if (result.type === 'Err') {
      return { model };
    }

    const modelNew = mergeWithServer({
      ctx,
      clientModel: model,
      serverModel: result.value,
    });

    return { model: modelNew };
  }

  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.updateFromServer({ ctx }, msg.c, model.c);
    return {
      model: { t: 'vs-user', c: updated[0] },
      actions: updated[1],
    };
  }

  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.updateFromServer({
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: 'vs-bot', c: updated[0] },
      cmd: Cmd.tag_('vs-bot', updated[1]),
      actions: updated[2],
    };
  }

  return { model };
};

export const mergeWithServer = ({
  clientModel,
  serverModel,
  ctx,
}: {
  ctx: Ctx;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  if (serverModel.t === 'none') {
    return { t: 'none' };
  }

  if (serverModel.t === 'vs-user') {
    const clientModelChild =
      clientModel.t === 'vs-user' ? clientModel.c : VsUser.init;

    return {
      t: 'vs-user',
      c: VsUser.mergeWithServer(clientModelChild, serverModel.c),
    };
  }

  if (serverModel.t === 'vs-bot') {
    const clientModelChild =
      clientModel.t === 'vs-bot'
        ? clientModel.c
        : VsBot.init({ userId: 'none' });

    return {
      t: 'vs-bot',
      c: VsBot.mergeWithServer({
        now: ctx.now,
        clientModel: clientModelChild,
        serverModel: serverModel.c,
      }),
    };
  }

  return clientModel;
};

//
//
// subscriptions
//
//

export const subscriptions = (ctx: Ctx, model: Model): Sub<Msg> => {
  if (model.t === 'vs-bot') {
    return Sub.tag_('vs-bot', VsBot.subscriptions(ctx, model.c));
  }

  return Sub.None;
};

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  model,
  $send,
  gameRoomCtx,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
  gameRoomCtx: RoomViewCtx;
}) => {
  const onQuit = () => $send({ t: 'input-mode', mode: 'none' });

  if (model.t === 'none') {
    return (
      <ViewMainMenu
        title="Tic-Tac-Toe"
        roomCtx={gameRoomCtx}
        coverArt={viewCoverArt()}
        buttons={[
          {
            label: 'Play Friend',
            icon: <IconUsers />,
            onClick: () => $send({ t: 'input-mode', mode: 'vs-user' }),
          },
          {
            label: 'Play Computer',
            icon: <IconComputerDesktop />,
            onClick: () => $send({ t: 'input-mode', mode: 'vs-bot' }),
          },
        ]}
      />
    );
  }

  if (model.t === 'vs-user') {
    return (
      <VsUser.View
        onCloseGame={onQuit}
        ctx={ctx}
        model={model.c}
        $send={(c) => $send({ t: 'vs-user', c })}
      />
    );
  }

  if (model.t === 'vs-bot') {
    return (
      <VsBot.View
        goBack={onQuit}
        ctx={ctx}
        model={model.c}
        $send={(c) => $send({ t: 'vs-bot', c })}
      />
    );
  }

  const check: never = model;
  return check;
};
