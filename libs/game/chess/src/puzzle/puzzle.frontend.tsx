import { PuzzleId } from './puzzle-id';
import { ToFrontend, Puzzle } from './puzzle.types';

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

export const updateFromBackend = ({
  msg,
  model,
}: {
  msg: ToFrontend;
  model: Model;
}) => {
  switch (msg[0]) {
    case 'find-many': {
      return { model };
    }

    case 'input-move': {
      return { model };
    }
  }
};

export const View = (_props: { model: Model }) => {
  return <div>todo</div>;
};
