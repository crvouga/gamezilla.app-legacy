import { NonEmpty } from '@gamezilla/shared/core';
import { Color, TerminalNode } from './flow';
import {
  GridNode,
  GridPuzzle,
  Position,
  init,
  positionToId,
  setNode,
} from './flow-grid';

export type GridPuzzleShorthand = NonEmpty<NonEmpty<string | null>>;

type Emoji = '🟡' | '🔵' | '🟢' | '🔴';

const isEmoji = (value: string): value is Emoji => {
  return ['🟡', '🔵', '🟢', '🔴'].includes(value);
};

export const emojiToColor = (emoji: Emoji): Color => {
  return {
    '🟡': 'yellow',
    '🔵': 'blue',
    '🟢': 'green',
    '🔴': 'red',
  }[emoji];
};

export const fromShorthandNode = (
  node: Position & { color: Emoji }
): GridNode & TerminalNode => {
  return {
    ...node,
    id: positionToId(node),
    color: emojiToColor(node.color),
    t: 'terminal',
  };
};

export const fromShorthand = (puzzle: GridPuzzleShorthand): GridPuzzle => {
  let grid = init({
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

      if (!isEmoji(emoji)) {
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
