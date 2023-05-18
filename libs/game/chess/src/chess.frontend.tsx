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
  ServerModel,
  ClientModel,
  ClientMsg,
  ToServer,
  ToClient,
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

export type Model = ClientModel;

export const init = (): [ClientModel, Cmd<Msg>] => {
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

export type Msg = ClientMsg;

export type OutAction = Alerts.Action;

export const update = ({
  msg,
  model,
  sendToServer,
  ctx,
}: {
  ctx: RoomCtx;
  sendToServer: (msg: ToServer) => Cmd;
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
        sendToServer(msg),
      ];
    }

    case 'vs-user': {
      if (model.mode.t === 'vs-user') {
        const [child, cmd] = VsUser.update(
          { sendToServer: (c) => sendToServer({ t: 'vs-user', c }) },
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
          { sendToServer: (c) => sendToServer({ t: 'vs-bot', c }) },
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
        sendToServer: (c) => sendToServer({ t: 'puzzle', c }),
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
  sendToServer,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  ctx: RoomCtx;
  msg: ToClient;
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
        clientModel: modelNew,
        serverModel: result.value,
        sendToServer,
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
  clientModel,
  serverModel,
  sendToServer,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): [ClientModel, Cmd<Msg>] => {
  switch (serverModel.t) {
    case 'none': {
      return [{ ...clientModel, mode: { t: 'none' } }, Cmd.None];
    }

    case 'puzzle': {
      if (clientModel.mode.t === 'puzzle') {
        return [
          {
            ...clientModel,
            mode: {
              t: 'puzzle',
              c: Puzzle.mergeWithBackend({
                clientModel: clientModel.mode.c,
                serverModel: serverModel.c,
              }),
            },
          },
          Cmd.None,
        ];
      }

      const initial = Puzzle.init({
        sendToServer: (c) => sendToServer({ t: 'puzzle', c }),
      });

      return [
        {
          ...clientModel,
          mode: {
            t: 'puzzle',
            c: Puzzle.mergeWithBackend({
              clientModel: initial.model,
              serverModel: serverModel.c,
            }),
          },
        },
        Cmd.tag_('puzzle', initial.cmd),
      ];
    }

    case 'vs-user': {
      if (clientModel.mode.t === 'vs-user') {
        return [
          {
            ...clientModel,
            mode: {
              t: 'vs-user',
              c: VsUser.mergeWithBackend(clientModel.mode.c, serverModel.c),
            },
          },
          Cmd.None,
        ];
      }

      const [child, childCmd] = VsUser.init({
        userId: 'none',
        sendToServer: (c) => sendToServer({ t: 'vs-user', c }),
      });

      return [
        {
          ...clientModel,
          mode: {
            t: 'vs-user',
            c: VsUser.mergeWithBackend(child, serverModel.c),
          },
        },
        Cmd.tag_('vs-user', childCmd),
      ];
    }

    case 'vs-bot': {
      if (clientModel.mode.t === 'vs-bot') {
        return [
          {
            ...clientModel,
            mode: {
              t: 'vs-bot',
              c: VsBot.mergeWithBackend(clientModel.mode.c, serverModel.c),
            },
          },
          Cmd.None,
        ];
      }

      const [child, childCmd] = VsBot.init();

      return [
        {
          ...clientModel,
          mode: {
            t: 'vs-bot',
            c: VsBot.mergeWithBackend(child, serverModel.c),
          },
        },
        Cmd.tag_('vs-bot', childCmd),
      ];
    }
  }
};
