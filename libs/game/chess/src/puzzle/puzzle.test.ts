import { MoveInput } from '../chess/chess-board';
import { uciMovesToPuzzleMoves, uciMoveToMoveInput } from './puzzle-database';
import { Puzzle } from './puzzle.types';

describe('puzzle', () => {
  it('maps uci move to move input', () => {
    const uci = 'e2e4';

    const expected: MoveInput = {
      from: 'E2',
      to: 'E4',
      promotion: 'q',
    };

    const actual = uciMoveToMoveInput(uci);

    expect(actual.type).toEqual('Ok');
    if (actual.type === 'Ok') {
      expect(actual.value.from).toEqual(expected.from);
      expect(actual.value.to).toEqual(expected.to);
    }
  });

  it('maps list of uci moves to list of move inputs', () => {
    const uciMoves = ['d3d7', 'e4g3'];
    const puzzleMoves = uciMovesToPuzzleMoves(uciMoves);

    const expected: Puzzle['moves'] = [
      {
        from: 'D3',
        to: 'D7',
        promotion: 'q',
      },
      {
        from: 'E4',
        to: 'G3',
        promotion: 'q',
      },
    ];

    expect(puzzleMoves.type).toEqual('Ok');
    if (puzzleMoves.type === 'Ok') {
      expect(puzzleMoves.value).toEqual(expected);
    }
  });
});
