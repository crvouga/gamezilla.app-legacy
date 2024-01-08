import * as Position from './position';

export type Direction = 'Down' | 'Left' | 'Right';

export const toPosition = (direction: Direction): Position.Position => {
  switch (direction) {
    case 'Down': {
      return {
        x: 0,
        y: 1,
      };
    }

    case 'Left': {
      return {
        x: -1,
        y: 0,
      };
    }

    case 'Right': {
      return {
        x: 1,
        y: 0,
      };
    }
  }
};
