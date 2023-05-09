import { findEndNode } from './flow';
import { bounds8x8, init } from './flow-grid';
import {
  GridPuzzleShorthand,
  fromShorthand,
  fromShorthandNode,
} from './flow-grid-shorthand';

const puzzleShorthand: GridPuzzleShorthand = [
  ['🔴', null, null],
  [null, null, null],
  [null, null, '🔴'],
];

describe('flow graph', () => {
  it('create grid graph', () => {
    const grid = init({
      bounds: bounds8x8,
    });

    expect(Object.keys(grid.nodes).length).toEqual(8 * 8);
  });

  it('finds the end position', () => {
    const puzzle = fromShorthand(puzzleShorthand);
    const startNode = fromShorthandNode({
      x: 0,
      y: 0,
      color: '🔴',
    });
    const actual = findEndNode(puzzle, startNode);
    const expected = fromShorthandNode({
      x: 2,
      y: 2,
      color: '🔴',
    });
    expect(actual?.id).toEqual(expected.id);
  });
});

//
//
//
//
//
//
