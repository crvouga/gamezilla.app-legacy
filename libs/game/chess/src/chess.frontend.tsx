import {
  Audio,
  Cmd,
  Posix,
  RemoteResult,
  Sub,
  Unit,
  p,
} from '@gamezilla/shared/core';
import {
  Alerts,
  RoomCtx,
  RoomViewCtx,
  ViewMainMenu,
} from '@gamezilla/shared/frontend';
import {
  IconComputerDesktop,
  IconPuzzlePiece,
  IconUsers,
} from '@gamezilla/shared/ui';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './chess.types';
import { viewCoverArt } from './chess/chess';
import Sounds from './chess/chess-sounds';
import * as Puzzle from './puzzle/puzzle.frontend';
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

export const init = (): [FrontendModel, Cmd<Msg>] => {
  return [
    {
      mode: { t: 'none' },
      requests: {},
    },
    Audio.preload(
      Array.from(Object.values(Sounds)),
      (): Msg => ({ t: 'preload-audio-done' })
    ),
  ];
};

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export type OutAction = Alerts.Action;

export const update = ({
  msg,
  model,
  sendToBackend,
  ctx,
}: {
  ctx: RoomCtx;
  sendToBackend: (msg: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg.t) {
    case 'preload-audio-done': {
      return [model, Cmd.None];
    }

    case 'input-mode': {
      return [
        {
          ...model,
          requests: { ...model.requests, [msg.t]: RemoteResult.Loading },
        },
        sendToBackend(msg),
      ];
    }

    case 'vs-user': {
      if (model.mode.t === 'vs-user') {
        const [child, cmd] = VsUser.update(
          { sendToBackend: (c) => sendToBackend({ t: 'vs-user', c }) },
          msg.c,
          model.mode.c
        );

        return [
          { ...model, mode: { t: 'vs-user', c: child } },
          Cmd.tag_('vs-user', cmd),
        ];
      }

      return [model, Cmd.None];
    }

    case 'vs-bot': {
      if (model.mode.t === 'vs-bot') {
        const [child, cmd] = VsBot.update(
          { sendToBackend: (c) => sendToBackend({ t: 'vs-bot', c }) },
          msg.c,
          model.mode.c
        );

        return [
          { ...model, mode: { t: 'vs-bot', c: child } },
          Cmd.tag_('vs-bot', cmd),
        ];
      }

      return [model, Cmd.None];
    }

    case 'puzzle': {
      if (model.mode.t !== 'puzzle') {
        return [model, Cmd.None];
      }

      const updated = Puzzle.update({
        ctx,
        sendToBackend: (c) => sendToBackend({ t: 'puzzle', c }),
        model: model.mode.c,
        msg: msg.c,
      });

      return [
        {
          ...model,
          mode: { t: 'puzzle', c: updated.model },
        },
        Cmd.tag_('puzzle', updated?.cmd ?? Cmd.None),
      ];
    }
  }
};

export const updateFromServer = ({
  ctx,
  msg,
  model,
  sendToBackend,
}: {
  sendToBackend: (msg: ToBackend) => Cmd;
  ctx: RoomCtx;
  msg: ToFrontend;
  model: Model;
}): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg.t) {
    case 'input-mode': {
      const { result } = msg;

      const modelNew: Model = {
        ...model,
        requests: {
          ...model.requests,
          [msg.t]: p(
            result,
            RemoteResult.map(() => Unit)
          ),
        },
      };

      if (result.type === 'Err') {
        return [modelNew, Cmd.None, []];
      }

      const merged = mergeWithBackend({
        frontendModel: modelNew,
        backendModel: result.value,
        sendToBackend,
      });

      return [...merged, []];
    }

    case 'vs-user': {
      if (model.mode.t === 'vs-user') {
        const [child, cmd, actions] = VsUser.updateFromServer(
          { ctx },
          msg.c,
          model.mode.c
        );

        return [
          { ...model, mode: { t: 'vs-user', c: child } },
          Cmd.tag_('vs-user', cmd),
          actions,
        ];
      }

      return [model, Cmd.None, []];
    }

    case 'vs-bot': {
      if (model.mode.t === 'vs-bot') {
        const [child, cmd, actions] = VsBot.updateFromServer(
          msg.c,
          model.mode.c
        );

        return [
          { ...model, mode: { t: 'vs-bot', c: child } },
          Cmd.tag_('vs-bot', cmd),
          actions,
        ];
      }

      return [model, Cmd.None, []];
    }

    case 'puzzle': {
      if (model.mode.t !== 'puzzle') {
        return [model, Cmd.None, []];
      }

      const updated = Puzzle.updateFromServer({
        ctx,
        model: model.mode.c,
        msg: msg.c,
      });

      return [
        { ...model, mode: { t: 'puzzle', c: updated.model } },
        Cmd.tag_('puzzle', updated?.cmd ?? Cmd.None),
        [],
      ];
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

export const subscriptions = ({
  intervalId,
  now,
  model,
}: {
  intervalId: string;
  now: Posix;
  model: Model;
}): Sub<Msg> => {
  switch (model.mode.t) {
    case 'vs-user': {
      return Sub.None;
    }
    case 'none': {
      return Sub.None;
    }
    case 'vs-bot': {
      return Sub.None;
    }
    case 'puzzle': {
      return Sub.tag_(
        'puzzle',
        Puzzle.subscriptions({ intervalId, now, model: model.mode.c })
      );
    }
  }
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
  ctx: RoomViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
  gameRoomCtx: RoomViewCtx;
}) => {
  switch (model.mode.t) {
    case 'none': {
      return (
        <ViewMainMenu
          title="Chess"
          roomCtx={gameRoomCtx}
          coverArt={viewCoverArt()}
          buttons={[
            {
              label: 'Play Computer',
              icon: <IconComputerDesktop />,
              onClick: () =>
                $send({
                  t: 'input-mode',
                  mode: 'vs-bot',
                  userId: ctx.currentUserId,
                }),
            },
            {
              label: 'Play Friend',
              icon: <IconUsers />,
              onClick: () =>
                $send({
                  t: 'input-mode',
                  mode: 'vs-user',
                  userId: ctx.currentUserId,
                }),
            },
            {
              label: 'Puzzles',
              icon: <IconPuzzlePiece />,
              onClick: () =>
                $send({
                  t: 'input-mode',
                  mode: 'puzzle',
                  userId: ctx.currentUserId,
                }),
            },
          ]}
        />
      );
    }

    case 'vs-bot': {
      return (
        <VsBot.View
          ctx={ctx}
          $send={(c) => $send({ t: 'vs-bot', c })}
          model={model.mode.c}
          onClose={() => {
            $send({ t: 'input-mode', mode: 'none', userId: ctx.currentUserId });
          }}
        />
      );
    }

    case 'vs-user': {
      return (
        <VsUser.View
          ctx={ctx}
          model={model.mode.c}
          $send={(c) => $send({ t: 'vs-user', c })}
          onClose={() => {
            $send({ t: 'input-mode', mode: 'none', userId: ctx.currentUserId });
          }}
        />
      );
    }

    case 'puzzle': {
      return (
        <Puzzle.View
          ctx={ctx}
          model={model.mode.c}
          $send={(c) => $send({ t: 'puzzle', c })}
          onClose={() => {
            $send({ t: 'input-mode', mode: 'none', userId: ctx.currentUserId });
          }}
        />
      );
    }
  }
};

//
//
//
//
//
//

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
  sendToBackend,
}: {
  sendToBackend: (msg: ToBackend) => Cmd;
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): [FrontendModel, Cmd<Msg>] => {
  switch (backendModel.t) {
    case 'none': {
      return [{ ...frontendModel, mode: { t: 'none' } }, Cmd.None];
    }

    case 'puzzle': {
      if (frontendModel.mode.t === 'puzzle') {
        return [
          {
            ...frontendModel,
            mode: {
              t: 'puzzle',
              c: Puzzle.mergeWithBackend({
                frontendModel: frontendModel.mode.c,
                backendModel: backendModel.c,
              }),
            },
          },
          Cmd.None,
        ];
      }

      const initial = Puzzle.init({
        sendToBackend: (c) => sendToBackend({ t: 'puzzle', c }),
      });

      return [
        {
          ...frontendModel,
          mode: {
            t: 'puzzle',
            c: Puzzle.mergeWithBackend({
              frontendModel: initial.model,
              backendModel: backendModel.c,
            }),
          },
        },
        Cmd.tag_('puzzle', initial.cmd),
      ];
    }

    case 'vs-user': {
      if (frontendModel.mode.t === 'vs-user') {
        return [
          {
            ...frontendModel,
            mode: {
              t: 'vs-user',
              c: VsUser.mergeWithBackend(frontendModel.mode.c, backendModel.c),
            },
          },
          Cmd.None,
        ];
      }

      const [child, childCmd] = VsUser.init({
        userId: 'none',
        sendToBackend: (c) => sendToBackend({ t: 'vs-user', c }),
      });

      return [
        {
          ...frontendModel,
          mode: {
            t: 'vs-user',
            c: VsUser.mergeWithBackend(child, backendModel.c),
          },
        },
        Cmd.tag_('vs-user', childCmd),
      ];
    }

    case 'vs-bot': {
      if (frontendModel.mode.t === 'vs-bot') {
        return [
          {
            ...frontendModel,
            mode: {
              t: 'vs-bot',
              c: VsBot.mergeWithBackend(frontendModel.mode.c, backendModel.c),
            },
          },
          Cmd.None,
        ];
      }

      const [child, childCmd] = VsBot.init();

      return [
        {
          ...frontendModel,
          mode: {
            t: 'vs-bot',
            c: VsBot.mergeWithBackend(child, backendModel.c),
          },
        },
        Cmd.tag_('vs-bot', childCmd),
      ];
    }
  }
};
