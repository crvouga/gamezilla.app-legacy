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
  }
};
