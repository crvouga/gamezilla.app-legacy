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

export type SspaceFn<TState> = (currentState: TState, currentDepth: number) => number

export type ChildrenFn<TState> = (currentState: TState) => Iterable<TState>

const findBestChildState = <TState>({
  sspaceFn,
  childrenFn,
  parentState,
  maxDepth,
}: {
  sspaceFn: SspaceFn<TState>
  childrenFn: ChildrenFn<TState>
  parentState: TState
  maxDepth: number
}) => {
  const calculateSspace = (
    currentState: TState,
    currentDepth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
  ): number => {
    if (currentDepth >= maxDepth) {
      return sspaceFn(currentState, currentDepth)
    }

    if (Array.from(childrenFn(currentState)).length === 0) {
      return sspaceFn(currentState, currentDepth)
    }

    if (isMaximizing) {
      let value = Number.NEGATIVE_INFINITY

      for (const child of childrenFn(currentState)) {
        value = Math.max(value, calculateSspace(child, currentDepth + 1, alpha, beta, false))

        if (value >= beta) {
          break
        }

        alpha = Math.max(alpha, value)
      }

      return value
    }

    let value = Number.POSITIVE_INFINITY

    for (const child of childrenFn(currentState)) {
      value = Math.min(value, calculateSspace(child, currentDepth + 1, alpha, beta, true))

      if (value <= alpha) {
        break
      }

      beta = Math.min(beta, value)
    }

    return value
  }

  let bestChildState: TState | null = null
  let bestChildSspace = Number.NEGATIVE_INFINITY
  for (const child of childrenFn(parentState)) {
    const childSspace = calculateSspace(child, 0, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true)

    if (childSspace > bestChildSspace) {
      bestChildState = child
      bestChildSspace = childSspace
    }
  }

  return bestChildState
}

export const Minimax = {
  findBestChildState,
}
