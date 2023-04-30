import { Cmd, Sub } from '@gamezilla/core';
import { RoomCtx, ViewMainMenu } from '@gamezilla/shared';
import { ProfileStore } from '@gamezilla/profile';
import { Alerts, Ctx } from '@gamezilla/shared';
import { IconComputerDesktop, IconUsers } from '@gamezilla/shared/ui';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './tic-tac-toe.types';
import { viewCoverArt } from './tic-tic-toe/tic-tac-toe-ui';
import * as VsBot from './vs-bot/vs-bot.frontend';
import * as VsUser from './vs-user/vs-user.frontend';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: Model = {
  t: 'none',
};

//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export type OutAction = ProfileStore.Action | Alerts.Action;

export const update = ({
  sendToBackend,
  msg,
  model,
  ctx,
}: {
  sendToBackend: (msg: ToBackend) => Cmd;
  ctx: RoomCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-mode') {
    return { model, cmd: sendToBackend(msg) };
  }

  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.update(
      {
        sendToBackend: (c) => sendToBackend({ t: 'vs-user', c }),
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
      sendToBackend: (c) => sendToBackend({ t: 'vs-bot', c }),
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

export const updateFromBackend = ({
  ctx,
  msg,
  model,
}: {
  ctx: Ctx;
  msg: ToFrontend;
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

    const modelNew = mergeWithBackend({
      ctx,
      frontendModel: model,
      backendModel: result.value,
    });

    return { model: modelNew };
  }

  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.updateFromBackend({ ctx }, msg.c, model.c);
    return {
      model: { t: 'vs-user', c: updated[0] },
      actions: updated[1],
    };
  }

  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.updateFromBackend({
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

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
  ctx,
}: {
  ctx: Ctx;
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): FrontendModel => {
  if (backendModel.t === 'none') {
    return { t: 'none' };
  }

  if (backendModel.t === 'vs-user') {
    const frontendModelChild =
      frontendModel.t === 'vs-user' ? frontendModel.c : VsUser.init;

    return {
      t: 'vs-user',
      c: VsUser.mergeWithBackend(frontendModelChild, backendModel.c),
    };
  }

  if (backendModel.t === 'vs-bot') {
    const frontendModelChild =
      frontendModel.t === 'vs-bot'
        ? frontendModel.c
        : VsBot.init({ userId: 'none' });

    return {
      t: 'vs-bot',
      c: VsBot.mergeWithBackend({
        now: ctx.now,
        frontendModel: frontendModelChild,
        backendModel: backendModel.c,
      }),
    };
  }

  return frontendModel;
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
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
  gameRoomCtx: RoomCtx;
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
