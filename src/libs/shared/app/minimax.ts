/*

https://en.wikipedia.org/wiki/Minimax
https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning

function alphabeta(node, depth, α, β, maximizingPlayer) is
    if depth = 0 or node is a terminal node then
        return the heuristic value of node
    if maximizingPlayer then
        value := −∞
        for each child of node do
            value := max(value, alphabeta(child, depth − 1, α, β, FALSE))
            if value ≥ β then
                break (* β cutoff *)
            α := max(α, value)
        return value
    else
        value := +∞
        for each child of node do
            value := min(value, alphabeta(child, depth − 1, α, β, TRUE))
            if value ≤ α then
                break (* α cutoff *)
            β := min(β, value)
        return value

*/

export type MinimaxCtx = {
  depth: number;
};

export type MinimaxConfig<TState> = {
  toScore: (ctx: MinimaxCtx, node: TState) => number;
  yieldChildren: (state: TState) => Generator<TState>;
};

const findBestChildState = <TState>({
  config,
  state,
  depth,
}: {
  config: MinimaxConfig<TState>;
  state: TState;
  depth: number;
}) => {
  const recur = (
    state: TState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number => {
    if (depth === 0) {
      return config.toScore({ depth }, state);
    }

    const children = config.yieldChildren(state);

    if (children.next().done) {
      return config.toScore({ depth }, state);
    }

    if (isMaximizing) {
      let value = -Infinity;

      for (const child of config.yieldChildren(state)) {
        value = Math.max(value, recur(child, depth - 1, alpha, beta, false));

        if (value >= beta) {
          break;
        }

        alpha = Math.max(alpha, value);
      }

      return value;
    }

    let value = Infinity;

    for (const child of config.yieldChildren(state)) {
      value = Math.min(value, recur(child, depth - 1, alpha, beta, true));

      if (value <= alpha) {
        break;
      }

      beta = Math.min(beta, value);
    }

    return value;
  };

  let bestState: TState | null = null;
  let bestScore = -Infinity;
  for (const child of config.yieldChildren(state)) {
    if (!bestState) {
      bestState = child;
      continue;
    }

    const childScore = recur(child, depth - 1, -Infinity, +Infinity, false);

    if (childScore > bestScore) {
      bestState = child;
      bestScore = childScore;
    }
  }

  return bestState;
};

export const Minimax = {
  findBestChildState,
};
