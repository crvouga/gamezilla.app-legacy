export const minimax = async <TNode>(
  config: {
    isTerminal: (node: TNode) => Promise<boolean>;
    toChildren: (node: TNode) => Promise<TNode[]>;
    toScore: (node: TNode) => Promise<number>;
  },
  node: TNode,
  depth: number,
  strategy: "max" | "min"
): Promise<number> => {
  const { isTerminal, toScore, toChildren } = config;

  if (depth === 0 || (await isTerminal(node))) {
    return await toScore(node);
  }

  if (strategy === "max") {
    let best = -Infinity;

    for (const child of await toChildren(node)) {
      best = Math.max(best, await minimax(config, child, depth - 1, "min"));
    }

    return best;
  }

  let best = +Infinity;

  for (const child of await toChildren(node)) {
    best = Math.min(best, await minimax(config, child, depth - 1, "max"));
  }

  return best;
};
