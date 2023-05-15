import { NonEmpty } from '@gamezilla/shared/core';
import { Color, Emoji } from '../flow';
import * as FlowGrid from './flow-grid';
import { Position } from './flow-grid-position';

export type Model = NonEmpty<NonEmpty<string | null>>;

export const fromShorthandNode = (
  node: Position & { color: Emoji }
): FlowGrid.Node => {
  return {
    ...node,
    id: FlowGrid.positionToId(node),
    color: Color.fromEmoji(node.color),
  };
};

export const fromShorthand = (model: Model): FlowGrid.Model => {
  let grid = FlowGrid.initEmpty({
    bounds: {
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: model[0].length,
        y: model.length,
      },
    },
  });

  for (let y = 0; y < model.length; y++) {
    const row = model[y];

    if (!row) {
      continue;
    }

    for (let x = 0; x < row.length; x++) {
      const emoji = row[x];

      if (!emoji) {
        continue;
      }

      if (!Emoji.is(emoji)) {
        continue;
      }

      const color = Color.fromEmoji(emoji);

      if (!color) {
        continue;
      }

      grid = FlowGrid.addNode(grid, {
        x,
        y,
        color,
      });
    }
  }

  return grid;
};

export type Size = '5x5' | '6x6' | '7x7' | '8x8';

export const samples = {
  '5x5': {
    '1': fromShorthand([
      [null, '🟡', '🔵', null, null],
      [null, '🟢', null, null, null],
      [null, '🟡', '🔴', null, null],
      ['🟢', '🔴', null, null, null],
      [null, null, null, null, '🔵'],
    ]),
    '2': fromShorthand([
      ['🔴', null, '🟢', null, '🟡'],
      [null, null, '🔵', null, '🟠'],
      [null, null, null, null, null],
      [null, '🟢', null, '🟡', null],
      [null, '🔴', '🔵', '🟠', null],
    ]),
  },
  '6x6': {},
  '7x7': {},
  '8x8': {},
};
