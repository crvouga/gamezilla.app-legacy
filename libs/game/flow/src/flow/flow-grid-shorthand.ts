import { NonEmpty } from '@gamezilla/shared/core';
import { Color, Puzzle, initGrid, setNode } from './flow';

export type GridShorthand = NonEmpty<NonEmpty<string | null>>;

const emojiToColor = (emoji: string): Color | null => {
  return (
    { '🟡': 'yellow', '🔵': 'blue', '🟢': 'green', '🔴': 'red' }[emoji] ?? null
  );
};

export const fromShorthand = (puzzle: GridShorthand): Puzzle => {
  let grid = initGrid({
    bounds: {
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: puzzle[0].length,
        y: puzzle.length,
      },
    },
  });

  for (let y = 0; y < puzzle.length; y++) {
    const row = puzzle[y];
    if (!row) {
      continue;
    }
    for (let x = 0; x < row.length; x++) {
      const emoji = row[x];
      if (!emoji) {
        continue;
      }
      const color = emojiToColor(emoji);
      if (!color) {
        continue;
      }

      grid = setNode(grid, {
        x,
        y,
        color,
      });
    }
  }

  return grid;
};

export const samples = {
  '5x5': fromShorthand([
    [null, '🟡', '🔵', null, null],
    [null, '🟢', null, null, null],
    [null, '🟡', '🔴', null, null],
    ['🟢', '🔴', null, null, null],
    [null, null, null, null, '🔵'],
  ]),
};
