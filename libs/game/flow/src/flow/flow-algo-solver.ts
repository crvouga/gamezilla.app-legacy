import { Model, doesPathExist, modelToKey, yieldTerminals } from './flow';

export type SolvedModel = Model & { _opaque: 'SolvedPuzzle' };

export const isSolved = (model: Model): model is SolvedModel => {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.end && !doesPathExist(model, terminal.start, terminal.end)) {
      return false;
    }
  }
  return true;
};

export const yieldSolutions = function* (
  puzzle: Model,
  solutions = new Set<string>()
): Generator<SolvedModel> {
  if (solutions.add(modelToKey(puzzle))) {
    return;
  }

  if (isSolved(puzzle)) {
    solutions.add(modelToKey(puzzle));
    yield puzzle;
    return;
  }

  for (const terminal of yieldTerminals(puzzle)) {
    if (!terminal.end) {
      return; //invalid model
    }

    if (doesPathExist(puzzle, terminal.start, terminal.end)) {
      continue;
    }
  }
};
