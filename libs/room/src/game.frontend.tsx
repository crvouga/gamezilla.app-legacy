import { Cmd, Sub } from '@gamezilla/core';
import { GameRoomCtx } from '@gamezilla/game-shared';
import { ChessFrontend as Chess } from '@gamezilla/game/chess';
import { ConnectFourFrontend as ConnectFour } from '@gamezilla/game/connect-four';
import { gomokuFrontend as Gomoku } from '@gamezilla/game/gomoku';
import { MazeFrontend as Maze } from '@gamezilla/game/maze';
import { SnakeFrontend as Snake } from '@gamezilla/game/snake';
import { TetrisFrontend as Tetris } from '@gamezilla/game/tetris';
import { TicTacToeFrontend as TicTacToe } from '@gamezilla/game/tic-tac-toe';
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
      return [{ type: 'tic-tac-toe', child: TicTacToe.init }, Cmd.None];
    }

    case 'connect-four': {
      return [{ type: 'connect-four', child: ConnectFour.init }, Cmd.None];
    }

    case 'Chess': {
      const [child, cmd] = Chess.init();
      return [{ type: 'Chess', child }, Cmd.tag('Chess', cmd)];
    }

    case 'gomoku': {
      return [{ type: 'gomoku', child: Gomoku.init }, Cmd.None];
    }

    case 'Tetris': {
      return [{ type: 'Tetris', child: Tetris.init }, Cmd.None];
    }

    case 'Snake': {
      return [{ type: 'Snake', child: Snake.init }, Cmd.None];
    }

    case 'Maze': {
      return [{ type: 'Maze', child: Maze.init({}) }, Cmd.None];
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
        const [child, cmd] = ConnectFour.update(
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
        const [child, cmd] = TicTacToe.update(
          { sendToBackend: (msg) => sendToBackend(['tic-tac-toe', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'tic-tac-toe', child }, Cmd.tag('tic-tac-toe', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Chess': {
      if (msg[0] === 'Chess') {
        const [child, cmd] = Chess.update(
          { sendToBackend: (msg) => sendToBackend(['Chess', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'Chess', child }, Cmd.tag('Chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'gomoku': {
      if (msg[0] === 'gomoku') {
        const [child, cmd] = Gomoku.update(
          { ctx, sendToBackend: (msg) => sendToBackend(['gomoku', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'gomoku', child }, Cmd.tag('gomoku', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Tetris': {
      if (msg[0] === 'Tetris') {
        const [child, cmd] = Tetris.update(
          { sendToBackend: (msg) => sendToBackend(['Tetris', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'Tetris', child }, Cmd.tag('Tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Snake': {
      if (msg[0] === 'Snake') {
        const [child, cmd] = Snake.update(
          { ctx, sendToBackend: (msg) => sendToBackend(['Snake', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'Snake', child }, Cmd.tag('Snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Maze': {
      if (msg[0] === 'Maze') {
        const [child, cmd] = Maze.update(
          { ctx, sendToBackend: (msg) => sendToBackend(['Maze', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'Maze', child }, Cmd.tag('Maze', cmd)];
      }
      return [model, Cmd.None];
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
        const [child, cmd, actions] = ConnectFour.updateFromBackend({
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
        const [child, cmd, actions] = TicTacToe.updateFromBackend(
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

    case 'Chess': {
      if (model.type === 'Chess') {
        const [child, cmd, actions] = Chess.updateFromBackend(
          {
            ctx,
            sendToBackend: (msg) => sendToBackend(['Chess', msg]),
          },
          msg[1],
          model.child
        );

        return [{ type: 'Chess', child }, Cmd.tag('Chess', cmd), actions];
      }
      return [model, Cmd.None, []];
    }

    case 'gomoku': {
      if (model.type === 'gomoku') {
        const [child, cmd] = Gomoku.updateFromBackend({
          ctx,
          msg: msg[1],
          model: model.child,
        });
        return [{ type: 'gomoku', child }, Cmd.tag('gomoku', cmd), []];
      }
      return [model, Cmd.None, []];
    }

    case 'Tetris': {
      if (model.type === 'Tetris') {
        const [child, cmd] = Tetris.updateFromBackend(msg[1], model.child);
        return [{ type: 'Tetris', child }, Cmd.tag('Tetris', cmd), []];
      }
      return [model, Cmd.None, []];
    }

    case 'Snake': {
      if (model.type === 'Snake') {
        const [child, cmd] = Snake.updateFromBackend(
          // { ctx, sendToBackend: (msg) => sendToBackend(['Snake', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'Snake', child }, Cmd.tag('Snake', cmd), []];
      }
      return [model, Cmd.None, []];
    }

    case 'Maze': {
      if (model.type === 'Maze') {
        const [child, cmd] = Maze.updateFromBackend(
          // { ctx, sendToBackend: (msg) => sendToBackend(['Maze', msg]) },
          msg[1],
          model.child
        );
        return [{ type: 'Maze', child }, Cmd.tag('Maze', cmd), []];
      }
      return [model, Cmd.None, []];
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
        ConnectFour.subscriptions(intervalId, model.child)
      );
    }

    case 'tic-tac-toe': {
      return Sub.tag('tic-tac-toe', TicTacToe.subscriptions(ctx, model.child));
    }

    case 'Chess': {
      return Sub.tag('Chess', Chess.subscriptions(model.child));
    }

    case 'gomoku': {
      return Sub.tag('gomoku', Gomoku.subscriptions(ctx, model.child));
    }

    case 'Tetris': {
      return Sub.tag('Tetris', Tetris.subscriptions(model.child));
    }

    case 'Snake': {
      return Sub.tag('Snake', Snake.subscriptions(intervalId, model.child));
    }

    case 'Maze': {
      return Sub.tag('Maze', Maze.subscriptions(model.child));
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
        <ConnectFour.View
          gameRoomCtx={gameRoomCtx}
          ctx={ctx}
          model={model.child}
          $send={(msg) => $send(['connect-four', msg])}
        />
      );
    }

    case 'tic-tac-toe': {
      return (
        <TicTacToe.View
          gameRoomCtx={gameRoomCtx}
          ctx={ctx}
          model={model.child}
          $send={(msg) => $send(['tic-tac-toe', msg])}
        />
      );
    }

    case 'Chess': {
      return (
        <Chess.View
          ctx={ctx}
          model={model.child}
          $send={(msg) => $send(['Chess', msg])}
          gameRoomCtx={gameRoomCtx}
        />
      );
    }

    case 'gomoku': {
      return Gomoku.view({
        $send: (msg) => $send(['gomoku', msg]),
        model: model.child,
        gameRoomCtx,
        ctx,
      });
    }

    case 'Tetris': {
      return Tetris.View({
        $send: (msg) => $send(['Tetris', msg]),
        model: model.child,
        // gameRoomCtx,
        // ctx,
      });
    }

    case 'Snake': {
      return Snake.View({
        $send: (msg) => $send(['Snake', msg]),
        model: model.child,
        // gameRoomCtx,
        ctx,
      });
    }

    case 'Maze': {
      return Maze.View({
        $send: (msg) => $send(['Maze', msg]),
        model: model.child,
        // gameRoomCtx,
        ctx,
      });
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
    case 'Chess': {
      if (frontendModel.type === 'Chess') {
        const merged = Chess.mergeWithBackend({
          sendToBackend: (msg) => sendToBackend(['Chess', msg]),
          frontendModel: frontendModel.child,
          backendModel: backendModel.child,
        });

        return [
          { type: 'Chess', child: merged[0] },
          Cmd.tag('Chess', merged[1]),
        ];
      }

      const initial = Chess.init();

      const merged = Chess.mergeWithBackend({
        sendToBackend: (msg) => sendToBackend(['Chess', msg]),
        frontendModel: initial[0],
        backendModel: backendModel.child,
      });

      return [
        {
          type: 'Chess',
          child: merged[0],
        },
        Cmd.batch([Cmd.tag('Chess', initial[1]), Cmd.tag('Chess', merged[1])]),
      ];
    }

    case 'connect-four': {
      if (frontendModel.type === 'connect-four') {
        return [
          {
            type: 'connect-four',
            child: ConnectFour.mergeWithBackend({
              ctx,
              frontendModel: frontendModel.child,
              backendModel: backendModel.child,
            }),
          },
          Cmd.None,
        ];
      }

      const initial = ConnectFour.init;

      return [
        {
          type: 'connect-four',
          child: ConnectFour.mergeWithBackend({
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
            child: TicTacToe.mergeWithBackend(
              frontendModel.child,
              backendModel.child
            ),
          },
          Cmd.None,
        ];
      }

      const initial = TicTacToe.init;

      return [
        {
          type: 'tic-tac-toe',
          child: TicTacToe.mergeWithBackend(initial, backendModel.child),
        },
        Cmd.None,
      ];
    }

    case 'gomoku': {
      if (frontendModel.type === 'gomoku') {
        return [
          {
            type: 'gomoku',
            child: Gomoku.mergeWithBackend({
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
          child: Gomoku.mergeWithBackend({
            ctx,
            frontendModel: Gomoku.init,
            backendModel: backendModel.child,
          }),
        },
        Cmd.None,
      ];
    }

    case 'Tetris': {
      if (frontendModel.type === 'Tetris') {
        return [
          {
            type: 'Tetris',
            child: Tetris.mergeWithBackend({
              frontendModel: frontendModel.child,
              backendModel: backendModel.child,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          type: 'Tetris',
          child: Tetris.mergeWithBackend({
            frontendModel: Tetris.init,
            backendModel: backendModel.child,
          }),
        },
        Cmd.None,
      ];
    }

    case 'Snake': {
      if (frontendModel.type === 'Snake') {
        return [
          {
            type: 'Snake',
            child: Snake.mergeWithBackend({
              frontendModel: frontendModel.child,
              backendModel: backendModel.child,
            }),
          },

          Cmd.None,
        ];
      }

      return [
        {
          type: 'Snake',
          child: Snake.mergeWithBackend({
            frontendModel: Snake.init,
            backendModel: backendModel.child,
          }),
        },
        Cmd.None,
      ];
    }

    case 'Maze': {
      if (frontendModel.type === 'Maze') {
        return [
          {
            type: 'Maze',
            child: Maze.mergeWithBackend({
              frontendModel: frontendModel.child,
              backendModel: backendModel.child,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          type: 'Maze',
          child: Maze.mergeWithBackend({
            frontendModel: Maze.init({}),
            backendModel: backendModel.child,
          }),
        },
        Cmd.None,
      ];
    }
  }
};
