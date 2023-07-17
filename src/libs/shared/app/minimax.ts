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

/**
 * The higher the score, the better the state is for the maximizing player.
 */
export type ScoreFn<TState> = (state: TState, currentDepth: number) => number;

/**
 * Returns all possible states that can be reached from the given state.
 */
export type ChildrenFn<TState> = (state: TState) => Iterable<TState>;

const findBestChildState = <TState>({
  scoreFn,
  childrenFn,
  parentState,
  maxDepth,
}: {
  scoreFn: ScoreFn<TState>;
  childrenFn: ChildrenFn<TState>;
  parentState: TState;
  maxDepth: number;
}) => {
  const calculateScore = (
    state: TState,
    currentDepth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number => {
    if (currentDepth >= maxDepth) {
      return scoreFn(state, currentDepth);
    }

    if (Array.from(childrenFn(state)).length === 0) {
      return scoreFn(state, currentDepth);
    }

    if (isMaximizing) {
      let value = -Infinity;

      for (const child of childrenFn(state)) {
        value = Math.max(
          value,
          calculateScore(child, currentDepth + 1, alpha, beta, false)
        );

        if (value >= beta) {
          break;
        }

        alpha = Math.max(alpha, value);
      }

      return value;
    }

    let value = Infinity;

    for (const child of childrenFn(state)) {
      value = Math.min(
        value,
        calculateScore(child, currentDepth + 1, alpha, beta, true)
      );

      if (value <= alpha) {
        break;
      }

      beta = Math.min(beta, value);
    }

    return value;
  };

  const [head, ...tail] = Array.from(childrenFn(parentState));

  let bestState: TState | null = head ?? null;
  let bestScore = -Infinity;
  for (const child of tail) {
    if (!bestState) {
      bestState = child;
      continue;
    }

    const childScore = calculateScore(child, 0, -Infinity, +Infinity, false);

    if (childScore >= bestScore) {
      bestState = child;
      bestScore = childScore;
    }
  }

  return bestState;
};

export const Minimax = {
  findBestChildState,
};
