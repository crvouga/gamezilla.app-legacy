import {
  Model,
  doesColoredPathExist,
  findEndNode,
  modelToKey,
  yieldTerminalNodes,
} from './flow';

export type SolvedModel = Model & { _opaque: 'SolvedPuzzle' };

export const isSolved = (model: Model): model is SolvedModel => {
  for (const nodeA of yieldTerminalNodes(model)) {
    for (const nodeB of yieldTerminalNodes(model)) {
      if (!doesColoredPathExist(model, nodeA, nodeB)) {
        return false;
      }
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

  for (const startNode of yieldTerminalNodes(puzzle)) {
    const endNode = findEndNode(puzzle, startNode);

    if (!endNode) {
      return; //invalid model
    }

    if (doesColoredPathExist(puzzle, startNode, endNode)) {
      continue;
    }
  }
};
