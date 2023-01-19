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

export const init = ({ gameName }: { gameName: Model[0] }): Model => {
  switch (gameName) {
    case 'connect-four': {
      return ['connect-four', ConnectFour.init];
    }

    case 'TicTacToe': {
      return ['TicTacToe', TicTacToe.init];
    }

    case 'Chess': {
      return ['Chess', Chess.init];
    }

    case 'Gomoku': {
      return ['Gomoku', Gomoku.init];
    }

    case 'Tetris': {
      return ['Tetris', Tetris.init];
    }

    case 'Snake': {
      return ['Snake', Snake.init];
    }

    case 'Maze': {
      return ['Maze', Maze.init];
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
      if (model[0] === 'connect-four') {
        const [child, cmd] = ConnectFour.update(
          { broadcast: (m) => broadcast(['connect-four', m]) },
          msg[1],
          model[1]
        );
        return [['connect-four', child], Cmd.tag('connect-four', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'TicTacToe': {
      if (model[0] === 'TicTacToe') {
        const [child, cmd] = TicTacToe.update(
          { broadcast: (m) => broadcast(['TicTacToe', m]) },
          msg[1],
          model[1]
        );
        return [['TicTacToe', child], Cmd.tag('TicTacToe', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Chess': {
      if (model[0] === 'Chess') {
        const [child, cmd] = Chess.update(
          { broadcast: (m) => broadcast(['Chess', m]) },
          msg[1],
          model[1]
        );
        return [['Chess', child], Cmd.tag('Chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Gomoku': {
      if (model[0] === 'Gomoku') {
        const [child, cmd] = Gomoku.update(msg[1], model[1]);
        return [['Gomoku', child], Cmd.tag('Gomoku', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Tetris': {
      if (model[0] === 'Tetris') {
        const [child, cmd] = Tetris.update(
          {
            broadcast: (m) => broadcast(['Tetris', m]),
          },
          msg[1],
          model[1]
        );
        return [['Tetris', child], Cmd.tag('Tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Snake': {
      if (model[0] === 'Snake') {
        const [child, cmd] = Snake.update(
          {
            broadcast: (m) => broadcast(['Snake', m]),
          },
          msg[1],
          model[1]
        );
        return [['Snake', child], Cmd.tag('Snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Maze': {
      if (model[0] === 'Maze') {
        const [child, cmd] = Maze.update(
          {
            broadcast: (m) => broadcast(['Maze', m]),
          },
          msg[1],
          model[1]
        );
        return [['Maze', child], Cmd.tag('Maze', cmd)];
      }
      return [model, Cmd.None];
    }
  }
};

export const updateFromFrontend = (
  {
    hostId,
    ctx,
    sendToClient,
    broadcast,
  }: {
    hostId: UserId;
    ctx: { currentUserId: UserId };
    sendToClient: (msg: ToFrontend) => Cmd;
    broadcast: (msg: ToFrontend) => Cmd;
  },
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'connect-four': {
      if (model[0] === 'connect-four') {
        const [child, cmd] = ConnectFour.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(['connect-four', msg]),
            broadcast: (msg) => broadcast(['connect-four', msg]),
          },
          msg[1],
          model[1]
        );
        return [['connect-four', child], Cmd.tag('connect-four', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'TicTacToe': {
      if (model[0] === 'TicTacToe') {
        const [child, cmd] = TicTacToe.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(['TicTacToe', msg]),
            broadcast: (msg) => broadcast(['TicTacToe', msg]),
          },
          msg[1],
          model[1]
        );
        return [['TicTacToe', child], Cmd.tag('TicTacToe', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Chess': {
      if (model[0] === 'Chess') {
        const [child, cmd] = Chess.updateFromFrontend(
          {
            hostId: hostId,
            sendToClient: (msg) => sendToClient(['Chess', msg]),
            broadcast: (msg) => broadcast(['Chess', msg]),
          },
          msg[1],
          model[1]
        );
        return [['Chess', child], Cmd.tag('Chess', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Gomoku': {
      if (model[0] === 'Gomoku') {
        const [child, cmd] = Gomoku.updateFromFrontend(
          {
            ctx,
            broadcast: (m) => broadcast(['Gomoku', m]),
            sendToClient: (m) => sendToClient(['Gomoku', m]),
          },
          msg[1],
          model[1]
        );
        return [['Gomoku', child], Cmd.tag('Gomoku', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Tetris': {
      if (model[0] === 'Tetris') {
        const [child, cmd] = Tetris.updateFromFrontend(
          {
            // ctx,
            broadcast: (m) => broadcast(['Tetris', m]),
            sendToClient: (m) => sendToClient(['Tetris', m]),
          },
          msg[1],
          model[1]
        );
        return [['Tetris', child], Cmd.tag('Tetris', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Snake': {
      if (model[0] === 'Snake') {
        const [child, cmd] = Snake.updateFromFrontend(
          {
            // ctx,
            broadcast: (m) => broadcast(['Snake', m]),
            sendToClient: (m) => sendToClient(['Snake', m]),
          },
          msg[1],
          model[1]
        );
        return [['Snake', child], Cmd.tag('Snake', cmd)];
      }
      return [model, Cmd.None];
    }

    case 'Maze': {
      if (model[0] === 'Maze') {
        const [child, cmd] = Maze.updateFromFrontend(
          {
            // ctx,
            broadcast: (m) => broadcast(['Maze', m]),
            // sendToClient: (m) => sendToClient(['Maze', m]),
          },
          msg[1],
          model[1]
        );
        return [['Maze', child], Cmd.tag('Maze', cmd)];
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
  switch (model[0]) {
    case 'Chess': {
      const [child, cmd] = Chess.updateRoomLeave(
        { broadcast: (msg) => broadcast(['Chess', msg]) },
        userId,
        model[1]
      );
      return [['Chess', child], Cmd.tag('Chess', cmd)];
    }

    case 'connect-four': {
      const [child, cmd] = ConnectFour.updateRoomLeave({
        userId,
        model: model[1],
        broadcast: (msg) => broadcast(['connect-four', msg]),
      });
      return [['connect-four', child], Cmd.tag('connect-four', cmd)];
    }

    case 'TicTacToe': {
      const [child, cmd] = TicTacToe.updateRoomLeave(
        { broadcast: (msg) => broadcast(['TicTacToe', msg]) },
        userId,
        model[1]
      );
      return [['TicTacToe', child], Cmd.tag('TicTacToe', cmd)];
    }

    case 'Gomoku': {
      const [child, cmd] = Gomoku.updateRoomLeave(userId, model[1]);
      return [['Gomoku', child], Cmd.tag('Gomoku', cmd)];
    }

    case 'Tetris': {
      const [child, cmd] = Tetris.updateRoomLeave(userId, model[1]);
      return [['Tetris', child], Cmd.tag('Tetris', cmd)];
    }

    case 'Snake': {
      const [child, cmd] = Snake.updateRoomLeave(userId, model[1]);
      return [['Snake', child], Cmd.tag('Snake', cmd)];
    }

    case 'Maze': {
      const [child, cmd] = Maze.updateRoomLeave(userId, model[1]);
      return [['Maze', child], Cmd.tag('Maze', cmd)];
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
  switch (model[0]) {
    case 'connect-four': {
      return Sub.tag(
        'connect-four',
        ConnectFour.subscriptions(intervalId, model[1])
      );
    }

    case 'TicTacToe': {
      return Sub.tag(
        'TicTacToe',
        TicTacToe.subscriptions(intervalId, model[1])
      );
    }

    case 'Chess': {
      return Sub.tag('Chess', Chess.subscriptions(intervalId, model[1]));
    }

    case 'Gomoku': {
      return Sub.tag('Gomoku', Gomoku.subscriptions(model[1]));
    }

    case 'Tetris': {
      return Sub.tag('Tetris', Tetris.subscriptions(intervalId, model[1]));
    }

    case 'Snake': {
      return Sub.tag('Snake', Snake.subscriptions(intervalId, model[1]));
    }

    case 'Maze': {
      return Sub.tag('Maze', Maze.subscriptions(intervalId, model[1]));
    }
  }
};
