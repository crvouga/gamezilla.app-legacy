import { Board, move, PlayerType, toBestMove } from './tic-tac-toe';

describe('tic-tac-toe', () => {
  it('makes winning move', () => {
    const before: Board = [
      ['X', 'O', '_'],
      ['O', 'X', '_'],
      ['_', '_', '_'],
    ];

    const expected: Board = [
      ['X', 'O', '_'],
      ['O', 'X', '_'],
      ['_', '_', 'X'],
    ];

    const maximizingPlayer = 'X';

    const found = toBestMove({
      depth: 2,
      maximizingPlayer,
      board: before,
    });

    expect(found.type).toBe('ok');

    if (found.t === 'err') {
      return;
    }

    const moved = move({
      board: before,
      player: maximizingPlayer,
      position: found.value,
    });

    expect(moved.type).toBe('ok');
    if (moved.t === 'err') {
      return;
    }
    expect(expected).toEqual(moved.value);
  });

  it('blocks winning move', () => {
    const before: Board = [
      ['X', 'O', '_'],
      ['X', '_', '_'],
      ['_', '_', '_'],
    ];

    const expected: Board = [
      ['X', 'O', '_'],
      ['X', '_', '_'],
      ['O', '_', '_'],
    ];

    const botPlayerType: PlayerType = 'O';

    const bestMoveResult = toBestMove({
      depth: 1,
      maximizingPlayer: botPlayerType,
      board: before,
    });

    expect(bestMoveResult.type).toBe('ok');

    if (bestMoveResult.t === 'err') {
      return;
    }

    const result = move({
      board: before,
      player: botPlayerType,
      position: bestMoveResult.value,
    });

    expect(result.t).toBe('ok');
    if (result.t === 'ok') {
      expect(expected).toEqual(result.value);
    }
  });
});
