import * as Chess from '@gamezilla/game/chess';
import * as ConnectFour from '@gamezilla/game/connect-four';
import * as Flow from '@gamezilla/game/flow';
import * as Gomoku from '@gamezilla/game/gomoku';
import * as Maze from '@gamezilla/game/maze';
import * as Snake from '@gamezilla/game/snake';
import * as Tetris from '@gamezilla/game/tetris';
import * as TicTacToe from '@gamezilla/game/tic-tac-toe';
import { ViewNode } from '@gamezilla/shared/ui';
import { GameName } from './game.shared';

export const viewCoverArt = (gameName: GameName): ViewNode => {
  switch (gameName) {
    case 'chess': {
      return Chess.viewCoverArt();
    }

    case 'connect-four': {
      return <ConnectFour.ViewCoverArt />;
    }

    case 'gomoku': {
      return Gomoku.viewCoverArt();
    }

    case 'tic-tac-toe': {
      return TicTacToe.viewCoverArt();
    }

    case 'tetris': {
      return Tetris.viewCoverArt();
    }

    case 'snake': {
      return Snake.viewCoverArt();
    }

    case 'maze': {
      return Maze.viewCoverArt();
    }

    case 'flow': {
      return Flow.viewCoverArt();
    }

    default: {
      const check: never = gameName;
      return check;
    }
  }
};

export const gameNameToString = (gameName: GameName) => {
  switch (gameName) {
    case 'chess': {
      return 'Chess';
    }

    case 'connect-four': {
      return 'Connect Four';
    }

    case 'gomoku': {
      return 'Gomoku';
    }

    case 'tic-tac-toe': {
      return 'Tic-Tac-Toe';
    }

    case 'tetris': {
      return 'Tetris';
    }

    case 'snake': {
      return 'Snake';
    }

    case 'maze': {
      return 'Maze';
    }

    case 'flow': {
      return 'Flow';
    }

    default: {
      const check: never = gameName;
      return check;
    }
  }
};
