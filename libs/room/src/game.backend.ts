import { Cmd, Sub } from '@gamezilla/core';
import { SharedMsg } from '@gamezilla/game-shared';
import { ChessBackend as Chess } from '@gamezilla/game/chess';
import { ConnectFourBackend as ConnectFour } from '@gamezilla/game/connect-four';
import { gomokuBackend as gomoku } from '@gamezilla/game/gomoku';
import { MazeBackend as Maze } from '@gamezilla/game/maze';
import { SnakeBackend as Snake } from '@gamezilla/game/snake';
import { TetrisBackend as Tetris } from '@gamezilla/game/tetris';
import { TicTacToeBackend as TicTacToe } from '@gamezilla/game/tic-tac-toe';
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
      return { type: 'connect-four', child: ConnectFour.init };
    }

    case 'tic-tac-toe': {
      return { type: 'tic-tac-toe', child: TicTacToe.init };
    }

    case 'Chess': {
      return { type: 'Chess', child: Chess.init };
    }

    case 'gomoku': {
      return { type: 'gomoku', child: gomoku.init };
    }

    case 'Tetris': {
      return { type: 'Tetris', child: Tetris.init };
    }

    case 'Snake': {
      return { type: 'Snake', child: Snake.init };
    }

    case 'Maze': {
      return { type: 'Maze', child: Maze.init };
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
        const [child, cmd] = ConnectFour.update(
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
        const [child, cmd] = TicTacToe.update(
          { broadcast: (m) => broadcast(['tic-tac-toe', m]) },
          msg[1],
          model.child
        );
        return [{ type: 'tic-tac-toe', child }, Cmd.tag('tic-tac-toe', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Chess': {
      if (model.type === 'Chess') {
        const [child, cmd] = Chess.update(
          { broadcast: (m) => broadcast(['Chess', m]) },
          msg[1],
          model.child
        );
        return [{ type: 'Chess', child }, Cmd.tag('Chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'gomoku': {
      if (model.type === 'gomoku') {
        const [child, cmd] = gomoku.update(msg[1], model.child);
        return [{ type: 'gomoku', child }, Cmd.tag('gomoku', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Tetris': {
      if (model.type === 'Tetris') {
        const [child, cmd] = Tetris.update(
          {
            broadcast: (m) => broadcast(['Tetris', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'Tetris', child }, Cmd.tag('Tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Snake': {
      if (model.type === 'Snake') {
        const [child, cmd] = Snake.update(
          {
            broadcast: (m) => broadcast(['Snake', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'Snake', child }, Cmd.tag('Snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Maze': {
      if (model.type === 'Maze') {
        const [child, cmd] = Maze.update(
          {
            broadcast: (m) => broadcast(['Maze', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'Maze', child }, Cmd.tag('Maze', cmd)];
      }
      return [model, Cmd.None];
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
        const [child, cmd] = ConnectFour.updateFromFrontend(
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
        const [child, cmd] = TicTacToe.updateFromFrontend(
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

    case 'Chess': {
      if (model.type === 'Chess') {
        const [child, cmd] = Chess.updateFromFrontend(
          {
            hostId: hostId,
            sendToClient: (msg) => sendToClient(['Chess', msg]),
            broadcast: (msg) => broadcast(['Chess', msg]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'Chess', child }, Cmd.tag('Chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'gomoku': {
      if (model.type === 'gomoku') {
        const [child, cmd] = gomoku.updateFromFrontend(
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

    case 'Tetris': {
      if (model.type === 'Tetris') {
        const [child, cmd] = Tetris.updateFromFrontend(
          {
            // ctx,
            broadcast: (m) => broadcast(['Tetris', m]),
            sendToClient: (m) => sendToClient(['Tetris', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'Tetris', child }, Cmd.tag('Tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Snake': {
      if (model.type === 'Snake') {
        const [child, cmd] = Snake.updateFromFrontend(
          {
            // ctx,
            broadcast: (m) => broadcast(['Snake', m]),
            sendToClient: (m) => sendToClient(['Snake', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'Snake', child }, Cmd.tag('Snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Maze': {
      if (model.type === 'Maze') {
        const [child, cmd] = Maze.updateFromFrontend(
          {
            // ctx,
            broadcast: (m) => broadcast(['Maze', m]),
            // sendToClient: (m) => sendToClient(['Maze', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'Maze', child }, Cmd.tag('Maze', cmd)];
      }
      return [model, Cmd.None];
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
    case 'Tetris': {
      return { model };
    }
    case 'Chess': {
      return { model };
    }
    case 'Snake': {
      return { model };
    }
    case 'connect-four': {
      return { model };
    }
    case 'tic-tac-toe': {
      const updated = TicTacToe.updateShared({
        broadcast: (m) => broadcast(['tic-tac-toe', m]),
        model: model.child,
        msg,
      });
      return {
        model: { type: 'tic-tac-toe', child: updated.model },
        cmd: Cmd.tag('tic-tac-toe', updated?.cmd ?? Cmd.None),
      };
    }
    case 'Maze': {
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
    case 'Chess': {
      const [child, cmd] = Chess.updateRoomLeave(
        { broadcast: (msg) => broadcast(['Chess', msg]) },
        userId,
        model.child
      );
      return [{ type: 'Chess', child }, Cmd.tag('Chess', cmd)];
    }

    case 'connect-four': {
      const [child, cmd] = ConnectFour.updateRoomLeave({
        userId,
        model: model.child,
        broadcast: (msg) => broadcast(['connect-four', msg]),
      });
      return [{ type: 'connect-four', child }, Cmd.tag('connect-four', cmd)];
    }

    case 'tic-tac-toe': {
      const [child, cmd] = TicTacToe.updateRoomLeave(
        { broadcast: (msg) => broadcast(['tic-tac-toe', msg]) },
        userId,
        model.child
      );
      return [{ type: 'tic-tac-toe', child }, Cmd.tag('tic-tac-toe', cmd)];
    }

    case 'gomoku': {
      const [child, cmd] = gomoku.updateRoomLeave(userId, model.child);
      return [{ type: 'gomoku', child }, Cmd.tag('gomoku', cmd)];
    }

    case 'Tetris': {
      const [child, cmd] = Tetris.updateRoomLeave(userId, model.child);
      return [{ type: 'Tetris', child }, Cmd.tag('Tetris', cmd)];
    }

    case 'Snake': {
      const [child, cmd] = Snake.updateRoomLeave(userId, model.child);
      return [{ type: 'Snake', child }, Cmd.tag('Snake', cmd)];
    }

    case 'Maze': {
      const [child, cmd] = Maze.updateRoomLeave(userId, model.child);
      return [{ type: 'Maze', child }, Cmd.tag('Maze', cmd)];
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
        ConnectFour.subscriptions(intervalId, model.child)
      );
    }

    case 'tic-tac-toe': {
      return Sub.tag(
        'tic-tac-toe',
        TicTacToe.subscriptions(intervalId, model.child)
      );
    }

    case 'Chess': {
      return Sub.tag('Chess', Chess.subscriptions(intervalId, model.child));
    }

    case 'gomoku': {
      return Sub.tag('gomoku', gomoku.subscriptions(model.child));
    }

    case 'Tetris': {
      return Sub.tag('Tetris', Tetris.subscriptions(intervalId, model.child));
    }

    case 'Snake': {
      return Sub.tag('Snake', Snake.subscriptions(intervalId, model.child));
    }

    case 'Maze': {
      return Sub.tag('Maze', Maze.subscriptions(intervalId, model.child));
    }
  }
};
