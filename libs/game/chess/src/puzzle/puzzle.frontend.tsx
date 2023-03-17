import { PuzzleId } from './puzzle-id';
import { Puzzle } from './puzzle.types';

export type Model = {
  puzzles: {
    [puzzleId: PuzzleId]: Puzzle;
  };
  activePuzzleId: PuzzleId;
};

type Msg = ['noop'];

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model } => {
  switch (msg[0]) {
    default: {
      return {
        model,
      };
    }
  }
};

export const View = (_props: { model: Model }) => {
  return <div>todo</div>;
};
