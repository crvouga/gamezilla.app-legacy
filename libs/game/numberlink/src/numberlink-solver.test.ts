import {
  findEndPosition,
  generateAllPaths,
  ModelSolved,
  ModelUnsolved,
  Position,
  solve,
} from './numberlink-solver';

const ___ = null;
const unsolved: ModelUnsolved = [
  ['1', ___, ___, ___, ___],
  [___, '4', '5', '3', '4'],
  [___, '5', ___, ___, '3'],
  [___, ___, ___, ___, ___],
  ['2', ___, ___, '2', '1'],
];

describe('numberlink solver', () => {
  it('finds the end position', () => {
    const start: Position = { x: 0, y: 0 };
    const expected: Position = { x: 4, y: 4 };
    const actual = findEndPosition(unsolved, start);
    expect(actual).toEqual(expected);
  });

  it('generates all possible paths', () => {
    const input: ModelUnsolved = [
      ['1', ___, ___],
      [___, ___, ___],
      [___, ___, '1'],
    ];

    const expected: ModelUnsolved[] = [
      [
        ['1', ___, ___],
        ['1', ___, ___],
        ['1', '1', '1'],
      ],
      [
        ['1', ___, ___],
        ['1', '1', '1'],
        ['1', '1', '1'],
      ],
      [
        ['1', '1', '1'],
        ['1', '1', '1'],
        ['1', '1', '1'],
      ],
      [
        ['1', '1', '1'],
        [___, ___, '1'],
        [___, ___, '1'],
      ],
      [
        ['1', '1', ___],
        [___, '1', '1'],
        [___, '1', '1'],
      ],
      [
        ['1', '1', ___],
        [___, '1', ___],
        [___, '1', '1'],
      ],
    ];

    const actual = Array.from(
      generateAllPaths(input, { x: 0, y: 0 }, { x: 2, y: 2 })
    );

    expect(actual).toEqual(expected);
  });
  //   it('should solve a simple puzzle', () => {
  //     const unsolved: ModelUnsolved = [
  //       ['1', null, null, null, null],
  //       [null, '4', '5', '3', '4'],
  //       [null, '5', null, null, '3'],
  //       [null, null, null, null, null],
  //       ['2', null, null, '2', '1'],
  //     ];

  //     const expected: ModelSolved = [
  //       ['1', '4', '4', '4', '4'],
  //       ['1', '4', '5', '3', '4'],
  //       ['1', '5', '5', '3', '3'],
  //       ['1', '1', '1', '1', '1'],
  //       ['2', '2', '2', '2', '1'],
  //     ];

  //     const solutions = solve(unsolved);
  //     expect(solutions).toEqual([expected]);
  //   });
});
