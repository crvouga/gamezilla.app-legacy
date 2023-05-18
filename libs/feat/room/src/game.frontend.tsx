import { ChessClient } from '@gamezilla/game/chess';
import { ConnectFourClient } from '@gamezilla/game/connect-four';
import { FlowClient } from '@gamezilla/game/flow';
import { GomokuClient } from '@gamezilla/game/gomoku';
import { MazeClient } from '@gamezilla/game/maze';
import { SnakeClient } from '@gamezilla/game/snake';
import { TetrisClient } from '@gamezilla/game/tetris';
import { TicTacToeClient } from '@gamezilla/game/tic-tac-toe';
import { Cmd, Sub, exhaustive } from '@gamezilla/shared/core';
import { Alerts, Ctx, RoomCtx, RoomViewCtx } from '@gamezilla/shared/client';
import {
  ServerModel,
  ClientModel,
  ClientMsg,
  ToServer,
  ToClient,
} from './game.types';

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = ({
  gameName,
  ctx,
}: {
  gameName: Model['t'];
  ctx: Ctx;
}): [Model, Cmd<Msg>] => {
  switch (gameName) {
    case 'tic-tac-toe': {
      return [{ t: 'tic-tac-toe', c: TicTacToeClient.init }, Cmd.None];
    }

    case 'connect-four': {
      return [{ t: 'connect-four', c: ConnectFourClient.init }, Cmd.None];
    }

    case 'chess': {
      const [child, cmd] = ChessClient.init();
      return [{ t: 'chess', c: child }, Cmd.tag_('chess', cmd)];
    }

    case 'gomoku': {
      return [{ t: 'gomoku', c: GomokuClient.init }, Cmd.None];
    }

    case 'tetris': {
      return [{ t: 'tetris', c: TetrisClient.init }, Cmd.None];
    }

    case 'snake': {
      return [{ t: 'snake', c: SnakeClient.init }, Cmd.None];
    }

    case 'maze': {
      return [
        {
          t: 'maze',
          c: MazeClient.init({
            userId: ctx.currentUserId,
          }),
        },
        Cmd.None,
      ];
    }

    case 'flow': {
      return [{ t: 'flow', c: FlowClient.init({}) }, Cmd.None];
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

export type Msg = ClientMsg;

export type OutAction = Alerts.Action;

export const update = ({
  ctx,
  sendToServer,
  msg,
  model,
}: {
  ctx: RoomCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (model.t) {
    case 'connect-four': {
      if (msg.t === 'connect-four') {
        const updated = ConnectFourClient.update({
          ctx,
          sendToServer: (msg) => sendToServer({ t: 'connect-four', c: msg }),
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: 'connect-four', c: updated.model },
          Cmd.tag_('connect-four', updated.cmd),
        ];
      }

      return [model, Cmd.None];
    }

    case 'tic-tac-toe': {
      if (msg.t === 'tic-tac-toe') {
        const updated = TicTacToeClient.update({
          sendToServer: (msg) => sendToServer({ t: 'tic-tac-toe', c: msg }),
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
        const [child, cmd] = ChessClient.update({
          ctx,
          sendToServer: (msg) => sendToServer({ t: 'chess', c: msg }),
          msg: msg.c,
          model: model.c,
        });
        return [{ t: 'chess', c: child }, Cmd.tag_('chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'gomoku': {
      if (msg.t === 'gomoku') {
        const updated = GomokuClient.update({
          ctx,
          sendToServer: (msg) => sendToServer({ t: 'gomoku', c: msg }),
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: 'gomoku', c: updated.model },
          Cmd.tag_('gomoku', updated.cmd),
        ];
      }
      return [model, Cmd.None];
    }

    case 'tetris': {
      if (msg.t === 'tetris') {
        const [child, cmd] = TetrisClient.update(
          { sendToServer: (msg) => sendToServer({ t: 'tetris', c: msg }) },
          msg.c,
          model.c
        );
        return [{ t: 'tetris', c: child }, Cmd.tag_('tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'snake': {
      if (msg.t === 'snake') {
        const [child, cmd] = SnakeClient.update(
          {
            ctx,
            sendToServer: (msg) => sendToServer({ t: 'snake', c: msg }),
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
        const [child, cmd] = MazeClient.update(
          { ctx, sendToServer: (msg) => sendToServer({ t: 'maze', c: msg }) },
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
      const updated = FlowClient.update({
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

export const updateFromServer = ({
  ctx,
  sendToServer,
  msg,
  model,
}: {
  ctx: RoomCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: ToClient;
  model: Model;
}): [Model, Cmd<Msg>, OutAction[]] => {
  if (msg.t === 'connect-four' && model.t === 'connect-four') {
    const [child, cmd, actions] = ConnectFourClient.updateFromServer({
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
    const updated = GomokuClient.updateFromServer({
      msg: msg.c,
      ctx,
      model: model.c,
    });

    return [
      { t: 'gomoku', c: updated.model },
      Cmd.tag_('gomoku', updated.cmd),
      [],
    ];
  }

  if (msg.t === 'tic-tac-toe' && model.t === 'tic-tac-toe') {
    const updated = TicTacToeClient.updateFromServer({
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
    const [child, cmd, actions] = ChessClient.updateFromServer({
      ctx,
      msg: msg.c,
      model: model.c,
      sendToServer: (msg) => sendToServer({ t: 'chess', c: msg }),
    });

    return [{ t: 'chess', c: child }, Cmd.tag_('chess', cmd), actions];
  }

  if (msg.t === 'tetris' && model.t === 'tetris') {
    const [child, cmd] = TetrisClient.updateFromServer(msg.c, model.c);
    return [{ t: 'tetris', c: child }, Cmd.tag_('tetris', cmd), []];
  }

  if (msg.t === 'snake' && model.t === 'snake') {
    const [child, cmd] = SnakeClient.updateFromServer(
      // { ctx, sendToServer: (msg) => sendToServer(['snake', msg]) },
      msg.c,
      model.c
    );
    return [{ t: 'snake', c: child }, Cmd.tag_('snake', cmd), []];
  }

  if (msg.t === 'maze' && model.t === 'maze') {
    const [child, cmd] = MazeClient.updateFromServer(
      // { ctx, sendToServer: (msg) => sendToServer(['maze', msg]) },
      msg.c,
      model.c
    );
    return [{ t: 'maze', c: child }, Cmd.tag_('maze', cmd), []];
  }

  if (msg.t === 'flow' && model.t === 'flow') {
    const updated = FlowClient.updateFromServer({
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
      ConnectFourClient.subscriptions(intervalId, ctx.now, model.c)
    );
  }

  if (model.t === 'tic-tac-toe') {
    return Sub.tag_('tic-tac-toe', TicTacToeClient.subscriptions(ctx, model.c));
  }

  if (model.t === 'chess') {
    return Sub.tag_(
      'chess',
      ChessClient.subscriptions({
        now: ctx.now,
        intervalId,
        model: model.c,
      })
    );
  }

  if (model.t === 'gomoku') {
    return Sub.tag_('gomoku', GomokuClient.subscriptions(ctx, model.c));
  }

  if (model.t === 'tetris') {
    return Sub.tag_('tetris', TetrisClient.subscriptions(model.c));
  }

  if (model.t === 'snake') {
    return Sub.tag_('snake', SnakeClient.subscriptions(intervalId, model.c));
  }

  if (model.t === 'maze') {
    return Sub.tag_('maze', MazeClient.subscriptions(model.c));
  }

  if (model.t === 'flow') {
    return Sub.tag_('flow', FlowClient.subscriptions(model.c));
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
  ctx: RoomViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  switch (model.t) {
    case 'connect-four': {
      return (
        <ConnectFourClient.View
          gameRoomCtx={ctx}
          ctx={ctx}
          model={model.c}
          $send={(c) => $send({ t: 'connect-four', c })}
        />
      );
    }

    case 'tic-tac-toe': {
      return (
        <TicTacToeClient.View
          gameRoomCtx={ctx}
          ctx={ctx}
          model={model.c}
          $send={(c) => $send({ t: 'tic-tac-toe', c })}
        />
      );
    }

    case 'chess': {
      return (
        <ChessClient.View
          ctx={ctx}
          model={model.c}
          gameRoomCtx={ctx}
          $send={(c) => $send({ t: 'chess', c })}
        />
      );
    }

    case 'gomoku': {
      return GomokuClient.view({
        $send: (c) => $send({ t: 'gomoku', c }),
        model: model.c,
        ctx,
        gameRoomCtx: ctx,
      });
    }

    case 'tetris': {
      return (
        <TetrisClient.View
          $send={(c) => $send({ t: 'tetris', c })}
          model={model.c}
        />
      );
    }

    case 'snake': {
      return (
        <SnakeClient.View
          $send={(c) => $send({ t: 'snake', c })}
          model={model.c}
          ctx={ctx}
        />
      );
    }

    case 'maze': {
      return (
        <MazeClient.View
          gameRoomCtx={ctx}
          $send={(c) => $send({ t: 'maze', c })}
          model={model.c}
          ctx={ctx}
        />
      );
    }

    case 'flow': {
      return (
        <FlowClient.View
          model={model.c}
          ctx={ctx}
          $send={(c) => $send({ t: 'flow', c })}
        />
      );
    }

    default: {
      return exhaustive(model);
    }
  }
};

export const mergeWithServer = ({
  ctx,
  sendToServer,
  clientModel,
  serverModel,
}: {
  ctx: Ctx;
  sendToServer: (msg: ToServer) => Cmd;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): [ClientModel, Cmd<Msg>] => {
  switch (serverModel.t) {
    case 'chess': {
      if (clientModel.t === 'chess') {
        const merged = ChessClient.mergeWithServer({
          sendToServer: (msg) => sendToServer({ t: 'chess', c: msg }),
          clientModel: clientModel.c,
          serverModel: serverModel.c,
        });

        return [{ t: 'chess', c: merged[0] }, Cmd.tag_('chess', merged[1])];
      }

      const initial = ChessClient.init();

      const merged = ChessClient.mergeWithServer({
        sendToServer: (msg) => sendToServer({ t: 'chess', c: msg }),
        clientModel: initial[0],
        serverModel: serverModel.c,
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
      if (clientModel.t === 'connect-four') {
        return [
          {
            t: 'connect-four',
            c: ConnectFourClient.mergeWithServer({
              ctx,
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      const initial = ConnectFourClient.init;

      return [
        {
          t: 'connect-four',
          c: ConnectFourClient.mergeWithServer({
            ctx,
            clientModel: initial,
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'tic-tac-toe': {
      if (clientModel.t === 'tic-tac-toe') {
        return [
          {
            t: 'tic-tac-toe',
            c: TicTacToeClient.mergeWithServer({
              ctx,
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      const initial = TicTacToeClient.init;

      return [
        {
          t: 'tic-tac-toe',
          c: TicTacToeClient.mergeWithServer({
            ctx,
            clientModel: initial,
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'gomoku': {
      if (clientModel.t === 'gomoku') {
        return [
          {
            t: 'gomoku',
            c: GomokuClient.mergeWithServer({
              ctx,
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: 'gomoku',
          c: GomokuClient.mergeWithServer({
            ctx,
            clientModel: GomokuClient.init,
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'tetris': {
      if (clientModel.t === 'tetris') {
        return [
          {
            t: 'tetris',
            c: TetrisClient.mergeWithServer({
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: 'tetris',
          c: TetrisClient.mergeWithServer({
            clientModel: TetrisClient.init,
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'snake': {
      if (clientModel.t === 'snake') {
        return [
          {
            t: 'snake',
            c: SnakeClient.mergeWithServer({
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },

          Cmd.None,
        ];
      }

      return [
        {
          t: 'snake',
          c: SnakeClient.mergeWithServer({
            clientModel: SnakeClient.init,
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'maze': {
      if (clientModel.t === 'maze') {
        return [
          {
            t: 'maze',
            c: MazeClient.mergeWithServer({
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: 'maze',
          c: MazeClient.mergeWithServer({
            clientModel: MazeClient.init({
              userId: ctx.currentUserId,
            }),
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case 'flow': {
      if (clientModel.t === 'flow') {
        return [
          {
            t: 'flow',
            c: FlowClient.mergeWithServer({
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: 'flow',
          c: FlowClient.mergeWithServer({
            clientModel: FlowClient.init({}),
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }
  }
};
