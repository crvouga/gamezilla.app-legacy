import { maxBy, minBy } from "./compare";

export const minimax = <TNode>({
  isTerminal,
  toChildren,
  toScore,
}: {
  isTerminal: (node: TNode) => boolean;
  toChildren: (node: TNode) => TNode[];
  toScore: (node: TNode) => number;
}) => {
  const recur = (node: TNode, depth: number, strategy: "max" | "min") => {
    if (depth === 0 || isTerminal(node)) {
      return {
        score: toScore(node),
        node,
      };
    }

    if (strategy === "max") {
      let best = {
        score: -Infinity,
        node,
      };

      for (const child of toChildren(node)) {
        best = maxBy((_) => _.score, recur(child, depth - 1, "min"), best);
      }

      return best;
    }

    let best = {
      score: +Infinity,
      node,
    };

    for (const child of toChildren(node)) {
      best = minBy((_) => _.score, recur(child, depth - 1, "max"), best);
    }

    return best;
  };

  return (node: TNode, depth: number) => {
    return recur(node, depth, "max");
  };
};
