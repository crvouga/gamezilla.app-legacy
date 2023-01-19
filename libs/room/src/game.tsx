import * as Chess from '@gamezilla/game/chess';
import * as ConnectFour from '@gamezilla/game/connect-four';
import * as Gomoku from '@gamezilla/game/gomoku';
import * as TicTacToe from '@gamezilla/game/tic-tac-toe';
import * as Tetris from '@gamezilla/game/tetris';
import * as Snake from '@gamezilla/game/snake';
import * as Maze from '@gamezilla/game/maze';
import { GameName } from './game.types';

export const viewCoverArt = (gameName: GameName) => {
  switch (gameName) {
    case 'Chess': {
      return Chess.viewCoverArt();
    }

    case 'connect-four': {
      return <ConnectFour.ViewCoverArt />;
    }

    case 'Gomoku': {
      return Gomoku.viewCoverArt();
    }

    case 'TicTacToe': {
      return TicTacToe.viewCoverArt();
    }

    case 'Tetris': {
      return Tetris.viewCoverArt();
    }

    case 'Snake': {
      return Snake.viewCoverArt();
    }

    case 'Maze': {
      return Maze.viewCoverArt();
    }
  }
};

export const gameNameToString = (gameName: GameName) => {
  switch (gameName) {
    case 'Chess': {
      return 'Chess';
    }

    case 'connect-four': {
      return 'Connect Four';
    }

    case 'Gomoku': {
      return 'Gomoku';
    }

    case 'TicTacToe': {
      return 'Tic-Tac-Toe';
    }

    case 'Tetris': {
      return 'Tetris';
    }

    case 'Snake': {
      return 'Snake';
    }

    case 'Maze': {
      return 'Maze';
    }
  }
};
