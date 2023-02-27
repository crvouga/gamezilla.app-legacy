import { Cmd, exhaustive, Sub } from '@gamezilla/core';
import { GameRoomCtx } from '@gamezilla/game-shared';
import { ChessFrontend } from '@gamezilla/game/chess';
import { ConnectFourFrontend } from '@gamezilla/game/connect-four';
import { GomokuFrontend } from '@gamezilla/game/gomoku';
import { MazeFrontend } from '@gamezilla/game/maze';
import { SnakeFrontend } from '@gamezilla/game/snake';
import { TetrisFrontend } from '@gamezilla/game/tetris';
import { TicTacToeFrontend } from '@gamezilla/game/tic-tac-toe';
import { FlowFrontend } from '@gamezilla/game/flow';
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
}: {
  gameName: Model['type'];
}): [Model, Cmd<Msg>] => {
  switch (gameName) {
    case 'tic-tac-toe': {
      return [{ type: 'tic-tac-toe', child: TicTacToeFrontend.init }, Cmd.None];
    }

    case 'connect-four': {
      return [
        { type: 'connect-four', child: ConnectFourFrontend.init },
        Cmd.None,
      ];
    }

    case 'chess': {
      const [child, cmd] = ChessFrontend.init();
      return [{ type: 'chess', child }, Cmd.tag('chess', cmd)];
    }

    case 'gomoku': {
      return [{ type: 'gomoku', child: GomokuFrontend.init }, Cmd.None];
    }

    case 'tetris': {
      return [{ type: 'tetris', child: TetrisFrontend.init }, Cmd.None];
    }

    case 'snake': {
      return [{ type: 'snake', child: SnakeFrontend.init }, Cmd.None];
    }

    case 'maze': {
      return [{ type: 'maze', child: MazeFrontend.init({}) }, Cmd.None];
    }

    case 'flow': {
      return [{ type: 'flow', child: FlowFrontend.init({}) }, Cmd.None];
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

export const update = (
  {
    ctx,
    sendToBackend,
  }: {
    ctx: Ctx;
    sendToBackend: (msg: ToBackend) => Cmd;
  },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (model.type) {
    case 'connect-four': {
      if (msg[0] === 'connect-four') {
        const [child, cmd] = ConnectFourFrontend.update(
          { ctx, sendToBackend: (msg) => sendToBackend(['connect-four', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'connect-four', child }, Cmd.tag('connect-four', cmd)];
      }

      return [model, Cmd.None];
    }

    case 'tic-tac-toe': {
      if (msg[0] === 'tic-tac-toe') {
        const [child, cmd] = TicTacToeFrontend.update(
          { sendToBackend: (msg) => sendToBackend(['tic-tac-toe', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'tic-tac-toe', child }, Cmd.tag('tic-tac-toe', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'chess': {
      if (msg[0] === 'chess') {
        const [child, cmd] = ChessFrontend.update(
          { sendToBackend: (msg) => sendToBackend(['chess', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'chess', child }, Cmd.tag('chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'gomoku': {
      if (msg[0] === 'gomoku') {
        const [child, cmd] = GomokuFrontend.update(
          { ctx, sendToBackend: (msg) => sendToBackend(['gomoku', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'gomoku', child }, Cmd.tag('gomoku', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'tetris': {
      if (msg[0] === 'tetris') {
        const [child, cmd] = TetrisFrontend.update(
          { sendToBackend: (msg) => sendToBackend(['tetris', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'tetris', child }, Cmd.tag('tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'snake': {
      if (msg[0] === 'snake') {
        const [child, cmd] = SnakeFrontend.update(
          { ctx, sendToBackend: (msg) => sendToBackend(['snake', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'snake', child }, Cmd.tag('snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'maze': {
      if (msg[0] === 'maze') {
        const [child, cmd] = MazeFrontend.update(
          { ctx, sendToBackend: (msg) => sendToBackend(['maze', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'maze', child }, Cmd.tag('maze', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'flow': {
      if (msg[0] !== 'flow') {
        return [model, Cmd.None];
      }
      const updated = FlowFrontend.update({
        msg: msg[1],
        model: model.child,
      });
      return [
        { type: 'flow', child: updated.model },
        Cmd.tag('flow', updated?.cmd ?? Cmd.None),
      ];
    }
  }
};

export const updateFromBackend = (
  {
    ctx,
    sendToBackend,
  }: {
    ctx: Ctx;
    sendToBackend: (msg: ToBackend) => Cmd;
  },
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'connect-four': {
      if (model.type === 'connect-four') {
        const [child, cmd, actions] = ConnectFourFrontend.updateFromBackend({
          msg: msg[1],
          ctx,
          model: model.child,
        });

        return [
          { type: 'connect-four', child },
          Cmd.tag('connect-four', cmd),
          actions,
        ];
      }
      return [model, Cmd.None, []];
    }

    case 'tic-tac-toe': {
      if (model.type === 'tic-tac-toe') {
        const [child, cmd, actions] = TicTacToeFrontend.updateFromBackend(
          { ctx },
          msg[1],
          model.child
        );
        return [
          { type: 'tic-tac-toe', child },
          Cmd.tag('tic-tac-toe', cmd),
          actions,
        ];
      }
      return [model, Cmd.None, []];
    }

    case 'chess': {
      if (model.type === 'chess') {
        const [child, cmd, actions] = ChessFrontend.updateFromBackend(
          {
            ctx,
            sendToBackend: (msg) => sendToBackend(['chess', msg]),
          },
          msg[1],
          model.child
        );

        return [{ type: 'chess', child }, Cmd.tag('chess', cmd), actions];
      }
      return [model, Cmd.None, []];
    }

    case 'gomoku': {
      if (model.type === 'gomoku') {
        const [child, cmd] = GomokuFrontend.updateFromBackend({
          ctx,
          msg: msg[1],
          model: model.child,
        });
        return [{ type: 'gomoku', child }, Cmd.tag('gomoku', cmd), []];
      }
      return [model, Cmd.None, []];
    }

    case 'tetris': {
      if (model.type === 'tetris') {
        const [child, cmd] = TetrisFrontend.updateFromBackend(
          msg[1],
          model.child
        );
        return [{ type: 'tetris', child }, Cmd.tag('tetris', cmd), []];
      }
      return [model, Cmd.None, []];
    }

    case 'snake': {
      if (model.type === 'snake') {
        const [child, cmd] = SnakeFrontend.updateFromBackend(
          // { ctx, sendToBackend: (msg) => sendToBackend(['snake', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'snake', child }, Cmd.tag('snake', cmd), []];
      }
      return [model, Cmd.None, []];
    }

    case 'maze': {
      if (model.type === 'maze') {
        const [child, cmd] = MazeFrontend.updateFromBackend(
          // { ctx, sendToBackend: (msg) => sendToBackend(['maze', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'maze', child }, Cmd.tag('maze', cmd), []];
      }
      return [model, Cmd.None, []];
    }

    case 'flow': {
      if (model.type !== 'flow') {
        return [model, Cmd.None, []];
      }
      const updated = FlowFrontend.updateFromBackend({
        msg: msg[1],
        model: model.child,
      });
      return [
        { type: 'flow', child: updated.model },
        Cmd.tag('flow', updated?.cmd ?? Cmd.None),
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

export const subscriptions = (
  intervalId: string,
  ctx: Ctx,
  model: Model
): Sub<Msg> => {
  switch (model.type) {
    case 'connect-four': {
      return Sub.tag(
        'connect-four',
        ConnectFourFrontend.subscriptions(intervalId, model.child)
      );
    }

    case 'tic-tac-toe': {
      return Sub.tag(
        'tic-tac-toe',
        TicTacToeFrontend.subscriptions(ctx, model.child)
      );
    }

    case 'chess': {
      return Sub.tag('chess', ChessFrontend.subscriptions(model.child));
    }

    case 'gomoku': {
      return Sub.tag('gomoku', GomokuFrontend.subscriptions(ctx, model.child));
    }

    case 'tetris': {
      return Sub.tag('tetris', TetrisFrontend.subscriptions(model.child));
    }

    case 'snake': {
      return Sub.tag(
        'snake',
        SnakeFrontend.subscriptions(intervalId, model.child)
      );
    }

    case 'maze': {
      return Sub.tag('maze', MazeFrontend.subscriptions(model.child));
    }

    case 'flow': {
      return Sub.tag('flow', FlowFrontend.subscriptions(model.child));
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
  gameRoomCtx,
  model,
  $send,
}: {
  ctx: Ctx;
  gameRoomCtx: GameRoomCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  switch (model.type) {
    case 'connect-four': {
      return (
        <ConnectFourFrontend.View
          gameRoomCtx={gameRoomCtx}
          ctx={ctx}
          model={model.child}
          $send={(msg) => $send(['connect-four', msg])}
        />
      );
    }

    case 'tic-tac-toe': {
      return (
        <TicTacToeFrontend.View
          gameRoomCtx={gameRoomCtx}
          ctx={ctx}
          model={model.child}
          $send={(msg) => $send(['tic-tac-toe', msg])}
        />
      );
    }

    case 'chess': {
      return (
        <ChessFrontend.View
          ctx={ctx}
          model={model.child}
          $send={(msg) => $send(['chess', msg])}
          gameRoomCtx={gameRoomCtx}
        />
      );
    }

    case 'gomoku': {
      return GomokuFrontend.view({
        $send: (msg) => $send(['gomoku', msg]),
        model: model.child,
        gameRoomCtx,
        ctx,
      });
    }

    case 'tetris': {
      return (
        <TetrisFrontend.View
          $send={(msg) => $send(['tetris', msg])}
          model={model.child}
        />
      );
    }

    case 'snake': {
      return (
        <SnakeFrontend.View
          $send={(msg) => $send(['snake', msg])}
          model={model.child}
          ctx={ctx}
        />
      );
    }

    case 'maze': {
      return (
        <MazeFrontend.View
          gameRoomCtx={gameRoomCtx}
          $send={(m) => $send(['maze', m])}
          model={model.child}
          ctx={ctx}
        />
      );
    }

    case 'flow': {
      return FlowFrontend.view({ model: model.child, gameRoomCtx });
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
  switch (backendModel.type) {
    case 'chess': {
      if (frontendModel.type === 'chess') {
        const merged = ChessFrontend.mergeWithBackend({
          sendToBackend: (msg) => sendToBackend(['chess', msg]),
          frontendModel: frontendModel.child,
          backendModel: backendModel.child,
        });

        return [
          { type: 'chess', child: merged[0] },
          Cmd.tag('chess', merged[1]),
        ];
      }

      const initial = ChessFrontend.init();

      const merged = ChessFrontend.mergeWithBackend({
        sendToBackend: (msg) => sendToBackend(['chess', msg]),
        frontendModel: initial[0],
        backendModel: backendModel.child,
      });

      return [
        {
          type: 'chess',
          child: merged[0],
        },
        Cmd.batch([Cmd.tag('chess', initial[1]), Cmd.tag('chess', merged[1])]),
      ];
    }

    case 'connect-four': {
      if (frontendModel.type === 'connect-four') {
        return [
          {
            type: 'connect-four',
            child: ConnectFourFrontend.mergeWithBackend({
              ctx,
              frontendModel: frontendModel.child,
              backendModel: backendModel.child,
            }),
          },
          Cmd.None,
        ];
      }

      const initial = ConnectFourFrontend.init;

      return [
        {
          type: 'connect-four',
          child: ConnectFourFrontend.mergeWithBackend({
            ctx,
            frontendModel: initial,
            backendModel: backendModel.child,
          }),
        },
        Cmd.None,
      ];
    }

    case 'tic-tac-toe': {
      if (frontendModel.type === 'tic-tac-toe') {
        return [
          {
            type: 'tic-tac-toe',
            child: TicTacToeFrontend.mergeWithBackend(
              frontendModel.child,
              backendModel.child
            ),
          },
          Cmd.None,
        ];
      }

      const initial = TicTacToeFrontend.init;

      return [
        {
          type: 'tic-tac-toe',
          child: TicTacToeFrontend.mergeWithBackend(
            initial,
            backendModel.child
          ),
        },
        Cmd.None,
      ];
    }

    case 'gomoku': {
      if (frontendModel.type === 'gomoku') {
        return [
          {
            type: 'gomoku',
            child: GomokuFrontend.mergeWithBackend({
              ctx,
              frontendModel: frontendModel.child,
              backendModel: backendModel.child,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          type: 'gomoku',
          child: GomokuFrontend.mergeWithBackend({
            ctx,
            frontendModel: GomokuFrontend.init,
            backendModel: backendModel.child,
          }),
        },
        Cmd.None,
      ];
    }

    case 'tetris': {
      if (frontendModel.type === 'tetris') {
        return [
          {
            type: 'tetris',
            child: TetrisFrontend.mergeWithBackend({
              frontendModel: frontendModel.child,
              backendModel: backendModel.child,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          type: 'tetris',
          child: TetrisFrontend.mergeWithBackend({
            frontendModel: TetrisFrontend.init,
            backendModel: backendModel.child,
          }),
        },
        Cmd.None,
      ];
    }

    case 'snake': {
      if (frontendModel.type === 'snake') {
        return [
          {
            type: 'snake',
            child: SnakeFrontend.mergeWithBackend({
              frontendModel: frontendModel.child,
              backendModel: backendModel.child,
            }),
          },

          Cmd.None,
        ];
      }

      return [
        {
          type: 'snake',
          child: SnakeFrontend.mergeWithBackend({
            frontendModel: SnakeFrontend.init,
            backendModel: backendModel.child,
          }),
        },
        Cmd.None,
      ];
    }

    case 'maze': {
      if (frontendModel.type === 'maze') {
        return [
          {
            type: 'maze',
            child: MazeFrontend.mergeWithBackend({
              frontendModel: frontendModel.child,
              backendModel: backendModel.child,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          type: 'maze',
          child: MazeFrontend.mergeWithBackend({
            frontendModel: MazeFrontend.init({}),
            backendModel: backendModel.child,
          }),
        },
        Cmd.None,
      ];
    }

    case 'flow': {
      if (frontendModel.type === 'flow') {
        return [
          {
            type: 'flow',
            child: FlowFrontend.mergeWithBackend({
              frontendModel: frontendModel.child,
              backendModel: backendModel.child,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          type: 'flow',
          child: FlowFrontend.mergeWithBackend({
            frontendModel: FlowFrontend.init({}),
            backendModel: backendModel.child,
          }),
        },
        Cmd.None,
      ];
    }
  }
};
