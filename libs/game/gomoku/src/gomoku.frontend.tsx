import { Cmd, Sub } from '@gamezilla/core';
import { GameRoomCtx, viewSelectModeScreen } from '@gamezilla/game-shared';
import { Ctx } from '@gamezilla/shared';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './gomoku.types';
import { viewCoverArt } from './gomoku/gomoku';
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
  type: 'none',
};

//
//
//
// update
//
//
//

export type Msg = FrontendMsg;

export const update = (
  { sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'input-mode': {
      return [model, sendToBackend(msg)];
    }
    case 'vs-bot': {
      if (model.type === 'vs-bot') {
        const [child, cmd] = VsBot.update(
          { sendToBackend: (m) => sendToBackend(['vs-bot', m]) },
          msg[1],
          model.child
        );
        return [{ type: 'vs-bot', child }, Cmd.tag('vs-bot', cmd)];
      }
      return [model, Cmd.None];
    }
    case 'vs-user': {
      if (model.type === 'vs-user') {
        const [child, cmd] = VsUser.update({
          sendToBackend: (m) => sendToBackend(['vs-user', m]),
          msg: msg[1],
          model: model.child,
        });
        return [{ type: 'vs-user', child }, Cmd.tag('vs-user', cmd)];
      }
      return [model, Cmd.None];
    }
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'input-mode': {
      if (msg[2].type === 'Err') {
        return [model, Cmd.None];
      }
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[2].value,
      });
      return [merged, Cmd.None];
    }

    case 'vs-bot': {
      if (model.type === 'vs-bot') {
        const [child, cmd] = VsBot.updateFromBackend(msg[1], model.child);
        return [{ type: 'vs-bot', child }, Cmd.tag('vs-bot', cmd)];
      }
      return [model, Cmd.None];
    }
    case 'vs-user': {
      if (model.type === 'vs-user') {
        const [child, cmd] = VsUser.updateFromBackend(msg[1], model.child);
        return [{ type: 'vs-user', child }, Cmd.tag('vs-user', cmd)];
      }
      return [model, Cmd.None];
    }
  }
};

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
}: {
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): FrontendModel => {
  switch (backendModel.type) {
    case 'none': {
      return { type: 'none' };
    }

    case 'vs-bot': {
      if (frontendModel.type === 'vs-bot') {
        return {
          type: 'vs-bot',
          child: VsBot.mergeWithBackend({
            frontendModel: frontendModel.child,
            backendModel: backendModel.child,
          }),
        };
      }
      return {
        type: 'vs-bot',
        child: VsBot.mergeWithBackend({
          frontendModel: VsBot.init({ userId: null }),
          backendModel: backendModel.child,
        }),
      };
    }

    case 'vs-user': {
      if (frontendModel.type === 'vs-user') {
        return {
          type: 'vs-user',
          child: VsUser.mergeWithBackend({
            frontendModel: frontendModel.child,
            backendModel: backendModel.child,
          }),
        };
      }
      return {
        type: 'vs-user',
        child: VsUser.mergeWithBackend({
          frontendModel: VsUser.init({ white: null, black: null }),
          backendModel: backendModel.child,
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

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
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
  ctx: Ctx;
  gameRoomCtx: GameRoomCtx;
  $send: (m: Msg) => void;
}) => {
  switch (model.type) {
    case 'none': {
      return viewSelectModeScreen({
        coverArt: viewCoverArt(),
        ctx,
        gameRoomCtx,
        onUserVsComputer: () =>
          $send(['input-mode', { userId: ctx.currentUserId, mode: 'vs-bot' }]),
        onVsUser: () =>
          $send(['input-mode', { userId: ctx.currentUserId, mode: 'vs-user' }]),
        title: 'Gomoku',
      });
    }

    case 'vs-bot': {
      return VsBot.view({
        model: model.child,
        ctx,
        onBack: () =>
          $send(['input-mode', { mode: 'none', userId: ctx.currentUserId }]),
        $send: (m) => $send(['vs-bot', m]),
      });
    }

    case 'vs-user': {
      return VsUser.view({
        model: model.child,
        ctx,
        onCancel: () =>
          $send(['input-mode', { mode: 'none', userId: ctx.currentUserId }]),
        $send: (m) => $send(['vs-user', m]),
      });
    }
  }
};

export const coverArt = viewCoverArt;
