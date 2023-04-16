import { Cmd, exhaustive, Sub } from '@gamezilla/core';
import { RoomCtx } from '@gamezilla/game-shared';
import { ChessFrontend } from '@gamezilla/game/chess';
import { ConnectFourFrontend } from '@gamezilla/game/connect-four';
import { FlowFrontend } from '@gamezilla/game/flow';
import { GomokuFrontend } from '@gamezilla/game/gomoku';
import { MazeFrontend } from '@gamezilla/game/maze';
import { SnakeFrontend } from '@gamezilla/game/snake';
import { TetrisFrontend } from '@gamezilla/game/tetris';
import { TicTacToeFrontend } from '@gamezilla/game/tic-tac-toe';
import { ProfileStore } from '@gamezilla/profile';
import { Alerts, Ctx } from '@gamezilla/shared';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './game.types';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init = ({
  gameName,
  ctx,
}: {
  gameName: Model['t'];
  ctx: Ctx;
}): [Model, Cmd<Msg>] => {
  switch (gameName) {
    case 'tic-tac-toe': {
      return [{ t: 'tic-tac-toe', c: TicTacToeFrontend.init }, Cmd.None];
    }

    case 'connect-four': {
      return [{ t: 'connect-four', c: ConnectFourFrontend.init }, Cmd.None];
    }

    case 'chess': {
      const [child, cmd] = ChessFrontend.init();
      return [{ t: 'chess', c: child }, Cmd.tag_('chess', cmd)];
    }

    case 'gomoku': {
      return [{ t: 'gomoku', c: GomokuFrontend.init }, Cmd.None];
    }

    case 'tetris': {
      return [{ t: 'tetris', c: TetrisFrontend.init }, Cmd.None];
    }

    case 'snake': {
      return [{ t: 'snake', c: SnakeFrontend.init }, Cmd.None];
    }

    case 'maze': {
      return [
        {
          t: 'maze',
          c: MazeFrontend.init({
            userId: ctx.currentUserId,
          }),
        },
        Cmd.None,
      ];
    }

    case 'flow': {
      return [{ t: 'flow', c: FlowFrontend.init({}) }, Cmd.None];
    }
  }
};

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export type OutAction = Alerts.Action | ProfileStore.Action;

export const update = ({
  ctx,
  sendToBackend,
  msg,
  model,
}: {
  ctx: RoomCtx;
  sendToBackend: (msg: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (model.t) {
    case 'connect-four': {
      if (msg.t === 'connect-four') {
        const [child, cmd] = ConnectFourFrontend.update(
          {
            ctx,
            sendToBackend: (msg) =>
              sendToBackend({ t: 'connect-four', c: msg }),
          },
          msg.c,
          model.c
        );
        return [{ t: 'connect-four', c: child }, Cmd.tag_('connect-four', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'tic-tac-toe': {
      if (msg.t === 'tic-tac-toe') {
        const updated = TicTacToeFrontend.update({
          sendToBackend: (msg) => sendToBackend({ t: 'tic-tac-toe', c: msg }),
          ctx,
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: 'tic-tac-toe', c: updated.model },
          Cmd.tag_('tic-tac-toe', updated.cmd),
        ];
      }
      return [model, Cmd.None];
    }

    case 'chess': {
      if (msg.t === 'chess') {
        const [child, cmd] = ChessFrontend.update({
          ctx,
          sendToBackend: (msg) => sendToBackend({ t: 'chess', c: msg }),
          msg: msg.c,
          model: model.c,
        });
        return [{ t: 'chess', c: child }, Cmd.tag_('chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'gomoku': {
      if (msg.t === 'gomoku') {
        const [child, cmd] = GomokuFrontend.update(
          {
            ctx,
            sendToBackend: (msg) => sendToBackend({ t: 'gomoku', c: msg }),
          },
          msg.c,
          model.c
        );
        return [{ t: 'gomoku', c: child }, Cmd.tag_('gomoku', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'tetris': {
      if (msg.t === 'tetris') {
        const [child, cmd] = TetrisFrontend.update(
          { sendToBackend: (msg) => sendToBackend({ t: 'tetris', c: msg }) },
          msg.c,
          model.c
        );
        return [{ t: 'tetris', c: child }, Cmd.tag_('tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'snake': {
      if (msg.t === 'snake') {
        const [child, cmd] = SnakeFrontend.update(
          {
            ctx,
            sendToBackend: (msg) => sendToBackend({ t: 'snake', c: msg }),
          },
          msg.c,
          model.c
        );
        return [{ t: 'snake', c: child }, Cmd.tag_('snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'maze': {
      if (msg.t === 'maze') {
        const [child, cmd] = MazeFrontend.update(
          { ctx, sendToBackend: (msg) => sendToBackend({ t: 'maze', c: msg }) },
          msg.c,
          model.c
        );
        return [{ t: 'maze', c: child }, Cmd.tag_('maze', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'flow': {
      if (msg.t !== 'flow') {
        return [model, Cmd.None];
      }
      const updated = FlowFrontend.update({
        msg: msg.c,
        model: model.c,
      });
      return [
        { t: 'flow', c: updated.model },
        Cmd.tag_('flow', updated?.cmd ?? Cmd.None),
      ];
    }
  }
};

export const updateFromBackend = ({
  ctx,
  sendToBackend,
  msg,
  model,
}: {
  ctx: RoomCtx;
  sendToBackend: (msg: ToBackend) => Cmd;
  msg: ToFrontend;
  model: Model;
}): [Model, Cmd<Msg>, OutAction[]] => {
  if (msg.t === 'connect-four' && model.t === 'connect-four') {
    const [child, cmd, actions] = ConnectFourFrontend.updateFromBackend({
      msg: msg.c,
      ctx,
      model: model.c,
    });

    return [
      { t: 'connect-four', c: child },
      Cmd.tag_('connect-four', cmd),
      actions,
    ];
  }

  if (msg.t === 'gomoku' && model.t === 'gomoku') {
    const [child, cmd] = GomokuFrontend.updateFromBackend({
      msg: msg.c,
      ctx,
      model: model.c,
    });

    return [{ t: 'gomoku', c: child }, Cmd.tag_('gomoku', cmd), []];
  }

  if (msg.t === 'tic-tac-toe' && model.t === 'tic-tac-toe') {
    const updated = TicTacToeFrontend.updateFromBackend({
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return [
      {
        t: 'tic-tac-toe',
        c: updated.model,
      },
      Cmd.tag_('tic-tac-toe', updated.cmd),
      updated.actions ?? [],
    ];
  }

  if (msg.t === 'chess' && model.t === 'chess') {
    const [child, cmd, actions] = ChessFrontend.updateFromBackend({
      ctx,
      msg: msg.c,
      model: model.c,
      sendToBackend: (msg) => sendToBackend({ t: 'chess', c: msg }),
    });

    return [{ t: 'chess', c: child }, Cmd.tag_('chess', cmd), actions];
  }

  if (msg.t === 'tetris' && model.t === 'tetris') {
    const [child, cmd] = TetrisFrontend.updateFromBackend(msg.c, model.c);
    return [{ t: 'tetris', c: child }, Cmd.tag_('tetris', cmd), []];
  }

  if (msg.t === 'snake' && model.t === 'snake') {
    const [child, cmd] = SnakeFrontend.updateFromBackend(
      // { ctx, sendToBackend: (msg) => sendToBackend(['snake', msg]) },
      msg.c,
      model.c
    );
    return [{ t: 'snake', c: child }, Cmd.tag_('snake', cmd), []];
  }

  if (msg.t === 'maze' && model.t === 'maze') {
    const [child, cmd] = MazeFrontend.updateFromBackend(
      // { ctx, sendToBackend: (msg) => sendToBackend(['maze', msg]) },
      msg.c,
      model.c
    );
    return [{ t: 'maze', c: child }, Cmd.tag_('maze', cmd), []];
  }

  if (msg.t === 'flow' && model.t === 'flow') {
    const updated = FlowFrontend.updateFromBackend({
      msg: msg.c,
      model: model.c,
    });
    return [
      { t: 'flow', c: updated.model },
      Cmd.tag_('flow', updated?.cmd ?? Cmd.None),
      [],
    ];
  }

  return [model, Cmd.None, []];
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
  intervalId: string,
  ctx: Ctx,
  model: Model
): Sub<Msg> => {
  if (model.t === 'connect-four') {
    return Sub.tag_(
      'connect-four',
      ConnectFourFrontend.subscriptions(intervalId, ctx.now, model.c)
    );
  }

  if (model.t === 'tic-tac-toe') {
    return Sub.tag_(
      'tic-tac-toe',
      TicTacToeFrontend.subscriptions(ctx, model.c)
    );
  }

  if (model.t === 'chess') {
    return Sub.tag_(
      'chess',
      ChessFrontend.subscriptions({
        now: ctx.now,
        intervalId,
        model: model.c,
      })
    );
  }

  if (model.t === 'gomoku') {
    return Sub.tag_('gomoku', GomokuFrontend.subscriptions(ctx, model.c));
  }

  if (model.t === 'tetris') {
    return Sub.tag_('tetris', TetrisFrontend.subscriptions(model.c));
  }

  if (model.t === 'snake') {
    return Sub.tag_('snake', SnakeFrontend.subscriptions(intervalId, model.c));
  }

  if (model.t === 'maze') {
    return Sub.tag_('maze', MazeFrontend.subscriptions(model.c));
  }

  if (model.t === 'flow') {
    return Sub.tag_('flow', FlowFrontend.subscriptions(model.c));
  }

  const exhaustiveCheck: never = model;
  return exhaustiveCheck;
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
}: {
  ctx: RoomCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  switch (model.t) {
    case 'connect-four': {
      return (
        <ConnectFourFrontend.View
          gameRoomCtx={ctx}
          ctx={ctx}
          model={model.c}
          $send={(c) => $send({ t: 'connect-four', c })}
        />
      );
    }

    case 'tic-tac-toe': {
      return (
        <TicTacToeFrontend.View
          gameRoomCtx={ctx}
          ctx={ctx}
          model={model.c}
          $send={(c) => $send({ t: 'tic-tac-toe', c })}
        />
      );
    }

    case 'chess': {
      return (
        <ChessFrontend.View
          ctx={ctx}
          model={model.c}
          gameRoomCtx={ctx}
          $send={(c) => $send({ t: 'chess', c })}
        />
      );
    }

    case 'gomoku': {
      return GomokuFrontend.view({
        $send: (c) => $send({ t: 'gomoku', c }),
        model: model.c,
        ctx,
        gameRoomCtx: ctx,
      });
    }

    case 'tetris': {
      return (
        <TetrisFrontend.View
          $send={(c) => $send({ t: 'tetris', c })}
          model={model.c}
        />
      );
    }

    case 'snake': {
      return (
        <SnakeFrontend.View
          $send={(c) => $send({ t: 'snake', c })}
          model={model.c}
          ctx={ctx}
        />
      );
    }

    case 'maze': {
      return (
        <MazeFrontend.View
          gameRoomCtx={ctx}
          $send={(c) => $send({ t: 'maze', c })}
          model={model.c}
          ctx={ctx}
        />
      );
    }

    case 'flow': {
      return FlowFrontend.view({ model: model.c, gameRoomCtx: ctx });
    }

    default: {
      return exhaustive(model);
    }
  }
};

export const mergeWithBackend = ({
  ctx,
  sendToBackend,
  frontendModel,
  backendModel,
}: {
  ctx: Ctx;
  sendToBackend: (msg: ToBackend) => Cmd;
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): [FrontendModel, Cmd<Msg>] => {
  switch (backendModel.t) {
    case 'chess': {
      if (frontendModel.t === 'chess') {
        const merged = ChessFrontend.mergeWithBackend({
          sendToBackend: (msg) => sendToBackend({ t: 'chess', c: msg }),
          frontendModel: frontendModel.c,
          backendModel: backendModel.c,
        });

        return [{ t: 'chess', c: merged[0] }, Cmd.tag_('chess', merged[1])];
      }

      const initial = ChessFrontend.init();

      const merged = ChessFrontend.mergeWithBackend({
        sendToBackend: (msg) => sendToBackend({ t: 'chess', c: msg }),
        frontendModel: initial[0],
        backendModel: backendModel.c,
      });

      return [
        {
          t: 'chess',
          c: merged[0],
        },
        Cmd.batch([
          Cmd.tag_('chess', initial[1]),
          Cmd.tag_('chess', merged[1]),
        ]),
      ];
    }

    case 'connect-four': {
      if (frontendModel.t === 'connect-four') {
        return [
          {
            t: 'connect-four',
            c: ConnectFourFrontend.mergeWithBackend({
              ctx,
              frontendModel: frontendModel.c,
              backendModel: backendModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      const initial = ConnectFourFrontend.init;

      return [
        {
          t: 'connect-four',
          c: ConnectFourFrontend.mergeWithBackend({
            ctx,
            frontendModel: initial,
            backendModel: backendModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'tic-tac-toe': {
      if (frontendModel.t === 'tic-tac-toe') {
        return [
          {
            t: 'tic-tac-toe',
            c: TicTacToeFrontend.mergeWithBackend({
              ctx,
              frontendModel: frontendModel.c,
              backendModel: backendModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      const initial = TicTacToeFrontend.init;

      return [
        {
          t: 'tic-tac-toe',
          c: TicTacToeFrontend.mergeWithBackend({
            ctx,
            frontendModel: initial,
            backendModel: backendModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'gomoku': {
      if (frontendModel.t === 'gomoku') {
        return [
          {
            t: 'gomoku',
            c: GomokuFrontend.mergeWithBackend({
              ctx,
              frontendModel: frontendModel.c,
              backendModel: backendModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: 'gomoku',
          c: GomokuFrontend.mergeWithBackend({
            ctx,
            frontendModel: GomokuFrontend.init,
            backendModel: backendModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'tetris': {
      if (frontendModel.t === 'tetris') {
        return [
          {
            t: 'tetris',
            c: TetrisFrontend.mergeWithBackend({
              frontendModel: frontendModel.c,
              backendModel: backendModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: 'tetris',
          c: TetrisFrontend.mergeWithBackend({
            frontendModel: TetrisFrontend.init,
            backendModel: backendModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'snake': {
      if (frontendModel.t === 'snake') {
        return [
          {
            t: 'snake',
            c: SnakeFrontend.mergeWithBackend({
              frontendModel: frontendModel.c,
              backendModel: backendModel.c,
            }),
          },

          Cmd.None,
        ];
      }

      return [
        {
          t: 'snake',
          c: SnakeFrontend.mergeWithBackend({
            frontendModel: SnakeFrontend.init,
            backendModel: backendModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'maze': {
      if (frontendModel.t === 'maze') {
        return [
          {
            t: 'maze',
            c: MazeFrontend.mergeWithBackend({
              frontendModel: frontendModel.c,
              backendModel: backendModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: 'maze',
          c: MazeFrontend.mergeWithBackend({
            frontendModel: MazeFrontend.init({
              userId: ctx.currentUserId,
            }),
            backendModel: backendModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'flow': {
      if (frontendModel.t === 'flow') {
        return [
          {
            t: 'flow',
            c: FlowFrontend.mergeWithBackend({
              frontendModel: frontendModel.c,
              backendModel: backendModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: 'flow',
          c: FlowFrontend.mergeWithBackend({
            frontendModel: FlowFrontend.init({}),
            backendModel: backendModel.c,
          }),
        },
        Cmd.None,
      ];
    }
  }
};
