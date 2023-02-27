import { Cmd, exhaustive, Sub } from '@gamezilla/core';
import { SharedMsg } from '@gamezilla/game-shared';
import { ChessBackend } from '@gamezilla/game/chess';
import { ConnectFourBackend } from '@gamezilla/game/connect-four';
import { FlowBackend } from '@gamezilla/game/flow';
import { GomokuBackend } from '@gamezilla/game/gomoku';
import { MazeBackend } from '@gamezilla/game/maze';
import { SnakeBackend } from '@gamezilla/game/snake';
import { TetrisBackend } from '@gamezilla/game/tetris';
import { TicTacToeBackend } from '@gamezilla/game/tic-tac-toe';
import { UserId } from '@gamezilla/shared';
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from './game.types';

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init = ({ gameName }: { gameName: Model['type'] }): Model => {
  switch (gameName) {
    case 'connect-four': {
      return { type: 'connect-four', child: ConnectFourBackend.init };
    }

    case 'tic-tac-toe': {
      return { type: 'tic-tac-toe', child: TicTacToeBackend.init };
    }

    case 'chess': {
      return { type: 'chess', child: ChessBackend.init };
    }

    case 'gomoku': {
      return { type: 'gomoku', child: GomokuBackend.init };
    }

    case 'tetris': {
      return { type: 'tetris', child: TetrisBackend.init };
    }

    case 'snake': {
      return { type: 'snake', child: SnakeBackend.init };
    }

    case 'maze': {
      return { type: 'maze', child: MazeBackend.init };
    }

    case 'flow': {
      return { type: 'flow', child: FlowBackend.init({}) };
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

export type Msg = BackendMsg;

export const update = (
  { broadcast }: { broadcast: (m: ToFrontend) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'connect-four': {
      if (model.type === 'connect-four') {
        const [child, cmd] = ConnectFourBackend.update(
          { broadcast: (m) => broadcast(['connect-four', m]) },
          msg[1],
          model.child
        );
        return [{ type: 'connect-four', child }, Cmd.tag('connect-four', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'tic-tac-toe': {
      if (model.type === 'tic-tac-toe') {
        const [child, cmd] = TicTacToeBackend.update(
          { broadcast: (m) => broadcast(['tic-tac-toe', m]) },
          msg[1],
          model.child
        );
        return [{ type: 'tic-tac-toe', child }, Cmd.tag('tic-tac-toe', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'chess': {
      if (model.type === 'chess') {
        const [child, cmd] = ChessBackend.update(
          { broadcast: (m) => broadcast(['chess', m]) },
          msg[1],
          model.child
        );
        return [{ type: 'chess', child }, Cmd.tag('chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'gomoku': {
      if (model.type === 'gomoku') {
        const [child, cmd] = GomokuBackend.update(msg[1], model.child);
        return [{ type: 'gomoku', child }, Cmd.tag('gomoku', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'tetris': {
      if (model.type === 'tetris') {
        const [child, cmd] = TetrisBackend.update(
          {
            broadcast: (m) => broadcast(['tetris', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'tetris', child }, Cmd.tag('tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'snake': {
      if (model.type === 'snake') {
        const [child, cmd] = SnakeBackend.update(
          {
            broadcast: (m) => broadcast(['snake', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'snake', child }, Cmd.tag('snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'maze': {
      if (model.type === 'maze') {
        const [child, cmd] = MazeBackend.update(
          {
            broadcast: (m) => broadcast(['maze', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'maze', child }, Cmd.tag('maze', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'flow': {
      if (model.type !== 'flow') {
        return [model, Cmd.None];
      }
      const updated = FlowBackend.update({
        model: model.child,
        msg: msg[1],
      });
      return [
        { type: 'flow', child: updated.model },
        Cmd.tag('flow', updated?.cmd ?? Cmd.None),
      ];
    }

    default: {
      return exhaustive(msg);
    }
  }
};

export const updateFromFrontend = (
  {
    hostId,
    currentUserId,
    sendToClient,
    broadcast,
  }: {
    hostId: UserId;
    currentUserId: UserId;
    sendToClient: (msg: ToFrontend) => Cmd;
    broadcast: (msg: ToFrontend) => Cmd;
  },
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'connect-four': {
      if (model.type === 'connect-four') {
        const [child, cmd] = ConnectFourBackend.updateFromFrontend(
          {
            currentUserId,
            sendToClient: (msg) => sendToClient(['connect-four', msg]),
            broadcast: (msg) => broadcast(['connect-four', msg]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'connect-four', child }, Cmd.tag('connect-four', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'tic-tac-toe': {
      if (model.type === 'tic-tac-toe') {
        const [child, cmd] = TicTacToeBackend.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(['tic-tac-toe', msg]),
            broadcast: (msg) => broadcast(['tic-tac-toe', msg]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'tic-tac-toe', child }, Cmd.tag('tic-tac-toe', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'chess': {
      if (model.type === 'chess') {
        const [child, cmd] = ChessBackend.updateFromFrontend(
          {
            hostId: hostId,
            sendToClient: (msg) => sendToClient(['chess', msg]),
            broadcast: (msg) => broadcast(['chess', msg]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'chess', child }, Cmd.tag('chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'gomoku': {
      if (model.type === 'gomoku') {
        const [child, cmd] = GomokuBackend.updateFromFrontend(
          {
            ctx: { currentUserId },
            broadcast: (m) => broadcast(['gomoku', m]),
            sendToClient: (m) => sendToClient(['gomoku', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'gomoku', child }, Cmd.tag('gomoku', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'tetris': {
      if (model.type === 'tetris') {
        const [child, cmd] = TetrisBackend.updateFromFrontend(
          {
            // ctx,
            broadcast: (m) => broadcast(['tetris', m]),
            sendToClient: (m) => sendToClient(['tetris', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'tetris', child }, Cmd.tag('tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'snake': {
      if (model.type === 'snake') {
        const [child, cmd] = SnakeBackend.updateFromFrontend(
          {
            // ctx,
            broadcast: (m) => broadcast(['snake', m]),
            sendToClient: (m) => sendToClient(['snake', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'snake', child }, Cmd.tag('snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'maze': {
      if (model.type === 'maze') {
        const [child, cmd] = MazeBackend.updateFromFrontend(
          {
            // ctx,
            broadcast: (m) => broadcast(['maze', m]),
            // sendToClient: (m) => sendToClient(['maze', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'maze', child }, Cmd.tag('maze', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'flow': {
      if (model.type !== 'flow') {
        return [model, Cmd.None];
      }
      const updated = FlowBackend.updateFromFrontend({
        model: model.child,
        msg: msg[1],
      });
      return [
        { type: 'flow', child: updated.model },
        Cmd.tag('flow', updated?.cmd ?? Cmd.None),
      ];
    }

    default: {
      return exhaustive(msg);
    }
  }
};

export const updateShared = ({
  model,
  msg,
  broadcast,
}: {
  msg: SharedMsg;
  model: Model;
  broadcast: (m: ToFrontend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (model.type) {
    case 'gomoku': {
      return { model };
    }
    case 'tetris': {
      return { model };
    }
    case 'chess': {
      return { model };
    }
    case 'snake': {
      return { model };
    }
    case 'connect-four': {
      return { model };
    }
    case 'tic-tac-toe': {
      const updated = TicTacToeBackend.updateShared({
        broadcast: (m) => broadcast(['tic-tac-toe', m]),
        model: model.child,
        msg,
      });
      return {
        model: { type: 'tic-tac-toe', child: updated.model },
        cmd: Cmd.tag('tic-tac-toe', updated?.cmd ?? Cmd.None),
      };
    }
    case 'maze': {
      return { model };
    }

    case 'flow': {
      return { model };
    }
  }
};

export const updateRoomLeave = (
  { broadcast }: { broadcast: (msg: ToFrontend) => Cmd },
  userId: UserId,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (model.type) {
    case 'chess': {
      const [child, cmd] = ChessBackend.updateRoomLeave(
        { broadcast: (msg) => broadcast(['chess', msg]) },
        userId,
        model.child
      );
      return [{ type: 'chess', child }, Cmd.tag('chess', cmd)];
    }

    case 'connect-four': {
      const [child, cmd] = ConnectFourBackend.updateRoomLeave({
        userId,
        model: model.child,
        broadcast: (msg) => broadcast(['connect-four', msg]),
      });
      return [{ type: 'connect-four', child }, Cmd.tag('connect-four', cmd)];
    }

    case 'tic-tac-toe': {
      const [child, cmd] = TicTacToeBackend.updateRoomLeave(
        { broadcast: (msg) => broadcast(['tic-tac-toe', msg]) },
        userId,
        model.child
      );
      return [{ type: 'tic-tac-toe', child }, Cmd.tag('tic-tac-toe', cmd)];
    }

    case 'gomoku': {
      const [child, cmd] = GomokuBackend.updateRoomLeave(userId, model.child);
      return [{ type: 'gomoku', child }, Cmd.tag('gomoku', cmd)];
    }

    case 'tetris': {
      const [child, cmd] = TetrisBackend.updateRoomLeave(userId, model.child);
      return [{ type: 'tetris', child }, Cmd.tag('tetris', cmd)];
    }

    case 'snake': {
      const [child, cmd] = SnakeBackend.updateRoomLeave(userId, model.child);
      return [{ type: 'snake', child }, Cmd.tag('snake', cmd)];
    }

    case 'maze': {
      const [child, cmd] = MazeBackend.updateRoomLeave(userId, model.child);
      return [{ type: 'maze', child }, Cmd.tag('maze', cmd)];
    }

    case 'flow': {
      return [model, Cmd.None];
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
  switch (model.type) {
    case 'connect-four': {
      return Sub.tag(
        'connect-four',
        ConnectFourBackend.subscriptions(intervalId, model.child)
      );
    }

    case 'tic-tac-toe': {
      return Sub.tag(
        'tic-tac-toe',
        TicTacToeBackend.subscriptions(intervalId, model.child)
      );
    }

    case 'chess': {
      return Sub.tag(
        'chess',
        ChessBackend.subscriptions(intervalId, model.child)
      );
    }

    case 'gomoku': {
      return Sub.tag('gomoku', GomokuBackend.subscriptions(model.child));
    }

    case 'tetris': {
      return Sub.tag(
        'tetris',
        TetrisBackend.subscriptions(intervalId, model.child)
      );
    }

    case 'snake': {
      return Sub.tag(
        'snake',
        SnakeBackend.subscriptions(intervalId, model.child)
      );
    }

    case 'maze': {
      return Sub.tag(
        'maze',
        MazeBackend.subscriptions(intervalId, model.child)
      );
    }

    case 'flow': {
      return Sub.tag('flow', FlowBackend.subscriptions(model.child));
    }
  }
};
