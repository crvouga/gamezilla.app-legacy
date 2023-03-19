import { Audio, Cmd, p, RemoteData, Sub, Unit } from '@gamezilla/core';
import { GameRoomCtx, ViewMainMenu } from '@gamezilla/game-shared';
import { Alerts, Ctx } from '@gamezilla/shared';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './chess.types';
import { viewCoverArt } from './chess/chess-board';
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
      mode: ['none'],
      requests: {
        InputMode: RemoteData.NotAsked,
      },
    },
    Audio.preload(
      Array.from(Object.values(Sounds)),
      (): Msg => ['preload-audio-done']
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
}: {
  sendToBackend: (msg: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'preload-audio-done': {
      return [model, Cmd.None];
    }

    case 'input-mode': {
      return [
        {
          ...model,
          requests: { ...model.requests, InputMode: RemoteData.Loading },
        },
        sendToBackend(msg),
      ];
    }

    case 'vs-user': {
      if (model.mode[0] === 'vs-user') {
        const [child, cmd] = VsUser.update(
          { sendToBackend: (msg) => sendToBackend(['vs-user', msg]) },
          msg[1],
          model.mode[1]
        );

        return [
          { ...model, mode: ['vs-user', child] },
          Cmd.tag('vs-user', cmd),
        ];
      }

      return [model, Cmd.None];
    }

    case 'vs-bot': {
      if (model.mode[0] === 'vs-bot') {
        const [child, cmd] = VsBot.update(
          { sendToBackend: (msg) => sendToBackend(['vs-bot', msg]) },
          msg[1],
          model.mode[1]
        );

        return [{ ...model, mode: ['vs-bot', child] }, Cmd.tag('vs-bot', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'puzzle': {
      if (model.mode[0] !== 'puzzle') {
        return [model, Cmd.None];
      }

      const updated = Puzzle.update({
        sendToBackend: (m) => sendToBackend(['puzzle', m]),
        model: model.mode[1],
        msg: msg[1],
      });

      return [
        {
          ...model,
          mode: ['puzzle', updated.model],
        },
        Cmd.tag('puzzle', updated?.cmd ?? Cmd.None),
      ];
    }
  }
};

export const updateFromBackend = (
  {
    ctx,
    sendToBackend,
  }: {
    sendToBackend: (msg: ToBackend) => Cmd;
    ctx: Ctx;
  },
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'input-mode-done': {
      const result = msg[2];

      const modelNew: Model = {
        ...model,
        requests: {
          ...model.requests,
          InputMode: p(
            result,
            RemoteData.map(() => Unit)
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
      if (model.mode[0] === 'vs-user') {
        const [child, cmd, actions] = VsUser.updateFromBackend(
          { ctx },
          msg[1],
          model.mode[1]
        );

        return [
          { ...model, mode: ['vs-user', child] },
          Cmd.tag('vs-user', cmd),
          actions,
        ];
      }

      return [model, Cmd.None, []];
    }

    case 'vs-bot': {
      if (model.mode[0] === 'vs-bot') {
        const [child, cmd, actions] = VsBot.updateFromBackend(
          msg[1],
          model.mode[1]
        );

        return [
          { ...model, mode: ['vs-bot', child] },
          Cmd.tag('vs-bot', cmd),
          actions,
        ];
      }

      return [model, Cmd.None, []];
    }

    case 'puzzle': {
      if (model.mode[0] !== 'puzzle') {
        return [model, Cmd.None, []];
      }

      const updated = Puzzle.updateFromBackend({
        model: model.mode[1],
        msg: msg[1],
      });

      return [
        { ...model, mode: ['puzzle', updated.model] },
        Cmd.tag('puzzle', updated?.cmd ?? Cmd.None),
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

export const subscriptions = (_model: Model): Sub<Msg> => {
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
  ctx: GameRoomCtx;
  model: Model;
  $send: (msg: Msg) => void;
  gameRoomCtx: GameRoomCtx;
}) => {
  switch (model.mode[0]) {
    case 'none': {
      return (
        <ViewMainMenu
          title="Chess"
          ctx={ctx}
          gameRoomCtx={gameRoomCtx}
          coverArt={viewCoverArt()}
          actions={[
            [
              'smart-toy',
              'Play Computer',
              () => {
                $send([
                  'input-mode',
                  { mode: 'vs-bot', userId: ctx.currentUserId },
                ]);
              },
            ],
            [
              'friends',
              'Play Friend',
              () => {
                $send([
                  'input-mode',
                  { mode: 'vs-user', userId: ctx.currentUserId },
                ]);
              },
            ],
            [
              'puzzle',
              'Puzzles',
              () => {
                $send([
                  'input-mode',
                  { mode: 'puzzle', userId: ctx.currentUserId },
                ]);
              },
            ],
          ]}
        />
      );
    }

    case 'vs-bot': {
      return (
        <VsBot.View
          ctx={ctx}
          $send={(msg) => $send(['vs-bot', msg])}
          model={model.mode[1]}
          onClose={() =>
            $send(['input-mode', { mode: 'none', userId: ctx.currentUserId }])
          }
        />
      );
    }

    case 'vs-user': {
      return (
        <VsUser.View
          ctx={ctx}
          model={model.mode[1]}
          $send={(msg) => $send(['vs-user', msg])}
          onClose={() =>
            $send(['input-mode', { mode: 'none', userId: ctx.currentUserId }])
          }
        />
      );
    }

    case 'puzzle': {
      return (
        <Puzzle.View
          ctx={ctx}
          model={model.mode[1]}
          $send={(m) => $send(['puzzle', m])}
          onClose={() =>
            $send(['input-mode', { mode: 'none', userId: ctx.currentUserId }])
          }
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
  switch (backendModel[0]) {
    case 'none': {
      return [{ ...frontendModel, mode: ['none'] }, Cmd.None];
    }

    case 'puzzle': {
      if (frontendModel.mode[0] === 'puzzle') {
        return [
          {
            ...frontendModel,
            mode: [
              'puzzle',
              Puzzle.mergeWithBackend({
                frontendModel: frontendModel.mode[1],
                backendModel: backendModel[1],
              }),
            ],
          },
          Cmd.None,
        ];
      }

      const initial = Puzzle.init();

      return [
        {
          ...frontendModel,
          mode: [
            'puzzle',
            Puzzle.mergeWithBackend({
              frontendModel: initial.model,
              backendModel: backendModel[1],
            }),
          ],
        },
        Cmd.tag('puzzle', initial.cmd),
      ];
    }

    case 'vs-user': {
      if (frontendModel.mode[0] === 'vs-user') {
        return [
          {
            ...frontendModel,
            mode: [
              'vs-user',
              VsUser.mergeWithBackend(frontendModel.mode[1], backendModel[1]),
            ],
          },
          Cmd.None,
        ];
      }

      const [child, childCmd] = VsUser.init({
        userId: 'none',
        sendToBackend: (msg) => sendToBackend(['vs-user', msg]),
      });

      return [
        {
          ...frontendModel,
          mode: ['vs-user', VsUser.mergeWithBackend(child, backendModel[1])],
        },
        Cmd.tag('vs-user', childCmd),
      ];
    }

    case 'vs-bot': {
      if (frontendModel.mode[0] === 'vs-bot') {
        return [
          {
            ...frontendModel,
            mode: [
              'vs-bot',
              VsBot.mergeWithBackend(frontendModel.mode[1], backendModel[1]),
            ],
          },
          Cmd.None,
        ];
      }

      const [child, childCmd] = VsBot.init({
        sendToBackend: (msg) => sendToBackend(['vs-bot', msg]),
      });

      return [
        {
          ...frontendModel,
          mode: ['vs-bot', VsBot.mergeWithBackend(child, backendModel[1])],
        },
        Cmd.tag('vs-bot', childCmd),
      ];
    }
  }
};
