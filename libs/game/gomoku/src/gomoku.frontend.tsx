import { Cmd, Sub } from '@gamezilla/core';
import {
  Ctx,
  RoomCtx,
  RoomViewCtx,
  ViewCtx,
  ViewMainMenu,
} from '@gamezilla/shared';
import { IconComputerDesktop, IconUsers } from '@gamezilla/shared/ui';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './gomoku.types';
import { ViewCoverArt } from './gomoku/gomoku-ui';
import * as VsBot from './vs-bot/vs-bot.frontend';
import * as VsUser from './vs-user/vs-user.frontend';

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init: Model = {
  t: 'none',
};

//
//
//
// update
//
//
//

export type Msg = FrontendMsg;

export const update = ({
  sendToBackend,
  ctx,
  msg,
  model,
}: {
  ctx: RoomCtx;
  sendToBackend: (m: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-mode') {
    return { model, cmd: sendToBackend(msg) };
  }

  if (model.t === 'vs-bot' && msg.t === 'vs-bot') {
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

  if (model.t === 'vs-user' && msg.t === 'vs-user') {
    const updated = VsUser.update({
      sendToBackend: (c) => sendToBackend({ t: 'vs-user', c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: 'vs-user', c: updated.model },
      cmd: Cmd.tag_('vs-user', updated.cmd),
    };
  }

  return { model };
};

export const updateFromBackend = ({
  ctx,
  model,
  msg,
}: {
  ctx: RoomCtx;
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-mode') {
    if (msg.result.type === 'Err') {
      return { model };
    }
    const merged = mergeWithBackend({
      ctx,
      frontendModel: model,
      backendModel: msg.result.value,
    });
    return { model: merged };
  }

  if (model.t === 'vs-bot' && msg.t === 'vs-bot') {
    const updated = VsBot.updateFromBackend({
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: 'vs-bot', c: updated.model },
      cmd: Cmd.tag_('vs-bot', updated.cmd),
    };
  }

  if (model.t === 'vs-user' && msg.t === 'vs-user') {
    const updated = VsUser.updateFromBackend({
      model: model.c,
      msg: msg.c,
    });
    return {
      model: { t: 'vs-user', c: updated.model },
      cmd: Cmd.tag_('vs-user', updated.cmd),
    };
  }

  return { model };
};

export const mergeWithBackend = ({
  ctx,
  frontendModel,
  backendModel,
}: {
  ctx: Ctx;
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): FrontendModel => {
  switch (backendModel.t) {
    case 'none': {
      return { t: 'none' };
    }

    case 'vs-bot': {
      if (frontendModel.t === 'vs-bot') {
        return {
          t: 'vs-bot',
          c: VsBot.mergeWithBackend({
            ctx,
            frontendModel: frontendModel.c,
            backendModel: backendModel.c,
          }),
        };
      }
      return {
        t: 'vs-bot',
        c: VsBot.mergeWithBackend({
          ctx,
          frontendModel: VsBot.init({ userId: null }),
          backendModel: backendModel.c,
        }),
      };
    }

    case 'vs-user': {
      if (frontendModel.t === 'vs-user') {
        return {
          t: 'vs-user',
          c: VsUser.mergeWithBackend({
            frontendModel: frontendModel.c,
            backendModel: backendModel.c,
          }),
        };
      }
      return {
        t: 'vs-user',
        c: VsUser.mergeWithBackend({
          frontendModel: VsUser.init({ white: null, black: null }),
          backendModel: backendModel.c,
        }),
      };
    }
  }
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (ctx: Ctx, model: Model): Sub<Msg> => {
  switch (model.t) {
    case 'vs-bot': {
      return Sub.tag_('vs-bot', VsBot.subscriptions(ctx, model.c));
    }

    case 'vs-user': {
      return Sub.None;
    }

    case 'none': {
      return Sub.None;
    }
  }
};

//
//
//
// view
//
//
//

export const view = ({
  model,
  ctx,
  gameRoomCtx,
  $send,
}: {
  model: Model;
  ctx: ViewCtx;
  gameRoomCtx: RoomViewCtx;
  $send: (m: Msg) => void;
}) => {
  switch (model.t) {
    case 'none': {
      return (
        <ViewMainMenu
          title="Gomoku"
          coverArt={ViewCoverArt()}
          roomCtx={gameRoomCtx}
          buttons={[
            {
              label: 'Play Computer',
              icon: <IconComputerDesktop />,
              onClick: () =>
                $send({
                  t: 'input-mode',
                  userId: ctx.currentUserId,
                  mode: 'vs-bot',
                }),
            },

            {
              label: 'Play Friend',
              icon: <IconUsers />,
              onClick: () =>
                $send({
                  t: 'input-mode',
                  userId: ctx.currentUserId,
                  mode: 'vs-user',
                }),
            },
          ]}
        />
      );
    }

    case 'vs-bot': {
      return VsBot.view({
        model: model.c,
        ctx,
        onBack: () =>
          $send({ t: 'input-mode', mode: 'none', userId: ctx.currentUserId }),
        $send: (c) => $send({ t: 'vs-bot', c }),
      });
    }

    case 'vs-user': {
      return VsUser.view({
        model: model.c,
        ctx,
        onCancel: () =>
          $send({ t: 'input-mode', mode: 'none', userId: ctx.currentUserId }),
        $send: (c) => $send({ t: 'vs-user', c }),
      });
    }
  }
};

export const coverArt = ViewCoverArt;
