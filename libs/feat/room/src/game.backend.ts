import { ChessBackend } from '@gamezilla/game/chess';
import { ConnectFourBackend } from '@gamezilla/game/connect-four';
import { FlowBackend } from '@gamezilla/game/flow';
import { GomokuBackend } from '@gamezilla/game/gomoku';
import { MazeBackend } from '@gamezilla/game/maze';
import { SnakeBackend } from '@gamezilla/game/snake';
import { TetrisBackend } from '@gamezilla/game/tetris';
import { TicTacToeBackend } from '@gamezilla/game/tic-tac-toe';
import { UserId } from '@gamezilla/shared/app';
import { RoomCtx, RoomRequestCtx } from '@gamezilla/shared/backend';
import { Cmd, exhaustive, Sub } from '@gamezilla/shared/core';
import { RoomMsg } from '@gamezilla/shared/frontend';
import { BackendModel, ServerMsg, ToBackend, ToFrontend } from './game.types';

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init = ({
  gameName,
  ctx,
}: {
  ctx: { currentUserId: UserId };
  gameName: Model['t'];
}): Model => {
  switch (gameName) {
    case 'connect-four': {
      return { t: 'connect-four', c: ConnectFourBackend.init };
    }

    case 'tic-tac-toe': {
      return { t: 'tic-tac-toe', c: TicTacToeBackend.init };
    }

    case 'chess': {
      return { t: 'chess', c: ChessBackend.init };
    }

    case 'gomoku': {
      return { t: 'gomoku', c: GomokuBackend.init };
    }

    case 'tetris': {
      return { t: 'tetris', c: TetrisBackend.init };
    }

    case 'snake': {
      return { t: 'snake', c: SnakeBackend.init };
    }

    case 'maze': {
      return {
        t: 'maze',
        c: MazeBackend.init({
          userId: ctx.currentUserId,
        }),
      };
    }

    case 'flow': {
      return { t: 'flow', c: FlowBackend.init };
    }

    default: {
      return exhaustive(gameName);
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

export type Msg = ServerMsg;

export const update = ({
  broadcast,
  msg,
  model,
  ctx,
}: {
  ctx: RoomCtx;
  broadcast: (m: ToFrontend) => Cmd;
  msg: Msg;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg.t) {
    case 'connect-four': {
      if (model.t === 'connect-four') {
        const updated = ConnectFourBackend.update({
          broadcast: (m) => broadcast({ t: 'connect-four', c: m }),
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
      if (model.t === 'tic-tac-toe') {
        const updated = TicTacToeBackend.update({
          broadcast: (m) => broadcast({ t: 'tic-tac-toe', c: m }),
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: 'tic-tac-toe', c: updated.model },
          Cmd.tag_('tic-tac-toe', updated.cmd ?? Cmd.None),
        ];
      }
      return [model, Cmd.None];
    }

    case 'chess': {
      if (model.t === 'chess') {
        const [child, cmd] = ChessBackend.update({
          broadcast: (m) => broadcast({ t: 'chess', c: m }),
          ctx,
          msg: msg.c,
          model: model.c,
        });
        return [{ t: 'chess', c: child }, Cmd.tag_('chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'gomoku': {
      if (model.t === 'gomoku') {
        const updated = GomokuBackend.update({
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
      if (model.t === 'tetris') {
        const [child, cmd] = TetrisBackend.update(
          {
            broadcast: (m) => broadcast({ t: 'tetris', c: m }),
          },
          msg.c,
          model.c
        );
        return [{ t: 'tetris', c: child }, Cmd.tag_('tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'snake': {
      if (model.t === 'snake') {
        const [child, cmd] = SnakeBackend.update(
          {
            broadcast: (m) => broadcast({ t: 'snake', c: m }),
          },
          msg.c,
          model.c
        );
        return [{ t: 'snake', c: child }, Cmd.tag_('snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'maze': {
      if (model.t === 'maze') {
        const [child, cmd] = MazeBackend.update(
          {
            broadcast: (m) => broadcast({ t: 'maze', c: m }),
          },
          msg.c,
          model.c
        );
        return [{ t: 'maze', c: child }, Cmd.tag_('maze', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'flow': {
      if (model.t !== 'flow') {
        return [model, Cmd.None];
      }
      const updated = FlowBackend.update({
        model: model.c,
        msg: msg.c,
      });
      return [
        { t: 'flow', c: updated.model },
        Cmd.tag_('flow', updated?.cmd ?? Cmd.None),
      ];
    }

    default: {
      return exhaustive(msg);
    }
  }
};

export const updateFromClient = ({
  sendToClient,
  broadcast,
  ctx,
  msg,
  model,
}: {
  ctx: RoomRequestCtx;
  sendToClient: (msg: ToFrontend) => Cmd;
  broadcast: (msg: ToFrontend) => Cmd;
  msg: ToBackend;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg.t) {
    case 'connect-four': {
      if (model.t === 'connect-four') {
        const updated = ConnectFourBackend.updateFromClient({
          ctx,
          sendToClient: (msg) => sendToClient({ t: 'connect-four', c: msg }),
          broadcast: (msg) => broadcast({ t: 'connect-four', c: msg }),
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
      if (model.t === 'tic-tac-toe') {
        const updated = TicTacToeBackend.updateFromClient({
          sendToClient: (msg) => sendToClient({ t: 'tic-tac-toe', c: msg }),
          broadcast: (msg) => broadcast({ t: 'tic-tac-toe', c: msg }),
          msg: msg.c,
          model: model.c,
          ctx,
        });
        return [
          { t: 'tic-tac-toe', c: updated.model },
          Cmd.tag_('tic-tac-toe', updated.cmd ?? Cmd.None),
        ];
      }
      return [model, Cmd.None];
    }

    case 'chess': {
      if (model.t === 'chess') {
        const [child, cmd] = ChessBackend.updateFromClient({
          sendToClient: (msg) => sendToClient({ t: 'chess', c: msg }),
          broadcast: (msg) => broadcast({ t: 'chess', c: msg }),
          msg: msg.c,
          model: model.c,
          ctx,
        });
        return [{ t: 'chess', c: child }, Cmd.tag_('chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'gomoku': {
      if (model.t === 'gomoku') {
        const updated = GomokuBackend.updateFromClient({
          ctx,
          broadcast: (m) => broadcast({ t: 'gomoku', c: m }),
          sendToClient: (m) => sendToClient({ t: 'gomoku', c: m }),
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
      if (model.t === 'tetris') {
        const [child, cmd] = TetrisBackend.updateFromClient(
          {
            // ctx,
            broadcast: (m) => broadcast({ t: 'tetris', c: m }),
            sendToClient: (m) => sendToClient({ t: 'tetris', c: m }),
          },
          msg.c,
          model.c
        );
        return [{ t: 'tetris', c: child }, Cmd.tag_('tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'snake': {
      if (model.t === 'snake') {
        const [child, cmd] = SnakeBackend.updateFromClient(
          {
            // ctx,
            broadcast: (m) => broadcast({ t: 'snake', c: m }),
            sendToClient: (m) => sendToClient({ t: 'snake', c: m }),
          },
          msg.c,
          model.c
        );
        return [{ t: 'snake', c: child }, Cmd.tag_('snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'maze': {
      if (model.t === 'maze') {
        const [child, cmd] = MazeBackend.updateFromClient(
          {
            // ctx,
            broadcast: (m) => broadcast({ t: 'maze', c: m }),
            // sendToClient: (m) => sendToClient(['maze', m]),
          },
          msg.c,
          model.c
        );
        return [{ t: 'maze', c: child }, Cmd.tag_('maze', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'flow': {
      if (model.t !== 'flow') {
        return [model, Cmd.None];
      }
      const updated = FlowBackend.updateFromClient({
        model: model.c,
        msg: msg.c,
        ctx,
      });
      return [
        { t: 'flow', c: updated.model },
        Cmd.tag_('flow', updated?.cmd ?? Cmd.None),
      ];
    }

    default: {
      return exhaustive(msg);
    }
  }
};

export const updateFromRoom = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (m: ToFrontend) => Cmd;
  msg: RoomMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (model.t) {
    case 'chess': {
      const updated = ChessBackend.updateFromRoom({
        broadcast: (m) => broadcast({ t: 'chess', c: m }),
        msg,
        model: model.c,
      });

      return {
        model: { t: 'chess', c: updated.model },
        cmd: Cmd.tag_('chess', updated.cmd ?? Cmd.None),
      };
    }

    case 'connect-four': {
      const updated = ConnectFourBackend.updateFromRoom({
        msg,
        model: model.c,
        broadcast: (m) => broadcast({ t: 'connect-four', c: m }),
      });
      return {
        model: { t: 'connect-four', c: updated.model },
        cmd: Cmd.tag_('connect-four', updated.cmd ?? Cmd.None),
      };
    }

    case 'tic-tac-toe': {
      const updated = TicTacToeBackend.updateFromRoom({
        broadcast: (msg) => broadcast({ t: 'tic-tac-toe', c: msg }),
        msg,
        model: model.c,
      });
      return {
        model: { t: 'tic-tac-toe', c: updated.model },
        cmd: Cmd.tag_('tic-tac-toe', updated.cmd ?? Cmd.None),
      };
    }

    case 'gomoku': {
      const updated = GomokuBackend.updateFromRoom({
        msg,
        model: model.c,
      });
      return {
        model: { t: 'gomoku', c: updated.model },
        cmd: Cmd.tag_('gomoku', updated.cmd ?? Cmd.None),
      };
    }

    case 'tetris': {
      return { model };
    }

    case 'snake': {
      return { model };
    }

    case 'maze': {
      return { model };
    }

    case 'flow': {
      return { model };
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

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model.t) {
    case 'connect-four': {
      return Sub.tag_(
        'connect-four',
        ConnectFourBackend.subscriptions(intervalId, model.c)
      );
    }

    case 'tic-tac-toe': {
      return Sub.tag_(
        'tic-tac-toe',
        TicTacToeBackend.subscriptions(intervalId, model.c)
      );
    }

    case 'chess': {
      return Sub.tag_('chess', ChessBackend.subscriptions(intervalId, model.c));
    }

    case 'gomoku': {
      return Sub.tag_('gomoku', GomokuBackend.subscriptions(model.c));
    }

    case 'tetris': {
      return Sub.tag_(
        'tetris',
        TetrisBackend.subscriptions(intervalId, model.c)
      );
    }

    case 'snake': {
      return Sub.tag_('snake', SnakeBackend.subscriptions(intervalId, model.c));
    }

    case 'maze': {
      return Sub.tag_('maze', MazeBackend.subscriptions(intervalId, model.c));
    }

    case 'flow': {
      return Sub.tag_('flow', FlowBackend.subscriptions(model.c));
    }
  }
};
