import { NonEmpty } from '@gamezilla/shared/core';
import { GroupId } from '../flow/flow';
import * as FlowGrid from './flow-grid';

export type Model = NonEmpty<NonEmpty<GroupId | null>>;

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
      const groupId = row[x];

      if (!groupId) {
        continue;
      }

      grid = FlowGrid.addNodeFromPosition(grid, {
        x,
        y,
      });
    }
  }

  return grid;
};

export type Size = '5x5' | '6x6' | '7x7' | '8x8';

export const samples = {
  '5x5': {
    '1': fromShorthand([
      [null, 'C', 'B', null, null],
      [null, 'D', null, null, null],
      [null, 'C', 'A', null, null],
      ['D', 'A', null, null, null],
      [null, null, null, null, 'B'],
    ]),
    '2': fromShorthand([
      ['A', null, 'D', null, 'C'],
      [null, null, 'B', null, 'E'],
      [null, null, null, null, null],
      [null, 'D', null, 'C', null],
      [null, 'A', 'B', 'E', null],
    ]),
  },
  '6x6': {
    '1': fromShorthand([
      [null, null, null, null, null, 'E'],
      [null, 'D', null, 'B', 'C', null],
      [null, null, null, null, null, null],
      ['A', null, null, null, null, null],
      [null, null, 'E', 'D', 'B', null],
      [null, null, null, 'A', 'C', null],
    ]),
  },
  '7x7': {},
  '8x8': {},
};
