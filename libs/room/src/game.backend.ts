import { Cmd, Sub } from '@gamezilla/core';
import { ChessBackend as Chess } from '@gamezilla/game/chess';
import { ConnectFourBackend as ConnectFour } from '@gamezilla/game/connect-four';
import { GomokuBackend as Gomoku } from '@gamezilla/game/gomoku';
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

    case 'TicTacToe': {
      return { type: 'TicTacToe', child: TicTacToe.init };
    }

    case 'Chess': {
      return { type: 'Chess', child: Chess.init };
    }

    case 'Gomoku': {
      return { type: 'Gomoku', child: Gomoku.init };
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

    case 'TicTacToe': {
      if (model.type === 'TicTacToe') {
        const [child, cmd] = TicTacToe.update(
          { broadcast: (m) => broadcast(['TicTacToe', m]) },
          msg[1],
          model.child
        );
        return [{ type: 'TicTacToe', child }, Cmd.tag('TicTacToe', cmd)];
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

    case 'Gomoku': {
      if (model.type === 'Gomoku') {
        const [child, cmd] = Gomoku.update(msg[1], model.child);
        return [{ type: 'Gomoku', child }, Cmd.tag('Gomoku', cmd)];
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

    case 'TicTacToe': {
      if (model.type === 'TicTacToe') {
        const [child, cmd] = TicTacToe.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(['TicTacToe', msg]),
            broadcast: (msg) => broadcast(['TicTacToe', msg]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'TicTacToe', child }, Cmd.tag('TicTacToe', cmd)];
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

    case 'Gomoku': {
      if (model.type === 'Gomoku') {
        const [child, cmd] = Gomoku.updateFromFrontend(
          {
            ctx: { currentUserId },
            broadcast: (m) => broadcast(['Gomoku', m]),
            sendToClient: (m) => sendToClient(['Gomoku', m]),
          },
          msg[1],
          model.child
        );
        return [{ type: 'Gomoku', child }, Cmd.tag('Gomoku', cmd)];
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

    case 'TicTacToe': {
      const [child, cmd] = TicTacToe.updateRoomLeave(
        { broadcast: (msg) => broadcast(['TicTacToe', msg]) },
        userId,
        model.child
      );
      return [{ type: 'TicTacToe', child }, Cmd.tag('TicTacToe', cmd)];
    }

    case 'Gomoku': {
      const [child, cmd] = Gomoku.updateRoomLeave(userId, model.child);
      return [{ type: 'Gomoku', child }, Cmd.tag('Gomoku', cmd)];
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

    case 'TicTacToe': {
      return Sub.tag(
        'TicTacToe',
        TicTacToe.subscriptions(intervalId, model.child)
      );
    }

    case 'Chess': {
      return Sub.tag('Chess', Chess.subscriptions(intervalId, model.child));
    }

    case 'Gomoku': {
      return Sub.tag('Gomoku', Gomoku.subscriptions(model.child));
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
