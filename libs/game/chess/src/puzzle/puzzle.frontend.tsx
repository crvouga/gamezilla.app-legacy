import { PuzzleId } from './puzzle-id';
import { Puzzle } from './puzzle.types';

export type Model = {
  puzzles: {
    [puzzleId: PuzzleId]: Puzzle;
  };
  activePuzzleId: PuzzleId;
};

export const View = (_props: { model: Model }) => {
  return <div>todo</div>;
};
