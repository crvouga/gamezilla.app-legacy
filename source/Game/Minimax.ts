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

export const create = <TState,>({
    toScore,
    toChildren,
}: {
    toScore: (node: TState) => number
    toChildren: (state: TState) => TState[]
}) => {
    const recur = (
        state: TState,
        depth: number,
        alpha: number,
        beta: number,
        isMaximizing: boolean,
    ): number => {
        if (depth === 0) {
            return toScore(state)
        }

        const children = toChildren(state)

        if (children.length === 0) {
            return toScore(state)
        }

        if (isMaximizing) {
            let value = -Infinity
            let alpha_ = alpha

            for (let index = 0; index < children.length; index++) {
                value = Math.max(
                    value,
                    recur(children[index]!, depth - 1, alpha_, beta, false),
                )

                if (value >= beta) {
                    break
                }

                alpha_ = Math.max(alpha_, value)
            }

            return value
        }

        let value = Infinity
        let beta_ = beta

        for (let index = 0; index < children.length; index++) {
            value = Math.min(
                value,
                recur(children[index]!, depth - 1, alpha, beta_, true),
            )

            if (value <= alpha) {
                break
            }

            beta_ = Math.min(beta_, value)
        }

        return value
    }

    const initialCall = (initialState: TState, depth: number): number => {
        return recur(initialState, depth, -Infinity, +Infinity, true)
    }

    return initialCall
}
