import { Result, Ok, Err } from "../../Core/Result"
import { Direction, Position } from "./Position"

export type Board = {
    [x: number]: {
        [y: number]: Stone,
    }
}

export type Stone = "white" | "black"

export const bounds = {
    lower: {
        x: 0,
        y: 0,
    },
    upper: {
        x: 15,
        y: 15,
    }
}

type MoveProblem = "out_of_bounds" | "not_turn"

const in_bounds = (position: Position): boolean => {
    return bounds.lower.x <= position.x && position.x <= bounds.upper.x && bounds.lower.y <= position.y && position.y <= bounds.upper.y
}

export const move = ({ position, stone, board }: { position: Position, stone: Stone, board: Board }): Result<MoveProblem, Board> => {
    if (!in_bounds(position)) {
        return Err("out_of_bounds")
    }

    const turn = to_turn(board)


    if (turn !== stone) {
        return Err("not_turn")
    }

    const board_new = set_stone(position, stone, board)

    return Ok(board_new)
}

export const set_stone = (position: Position, stone: Stone, board: Board): Board => {
    return {
        ...board,
        [position.x]: {
            ...board[position.x],
            [position.y]: stone
        }
    }
}

const to_stone = (position: Position, board: Board): Stone | null => {
    return board[position.x]?.[position.y] ?? null
}


const to_turn = (board: Board): Stone => {
    const freq = { black: 0, white: 0 }

    for (const x in board) {
        for (const y in board[x]) {
            const stone = board[Number(x)]?.[Number(y)]
            if (!stone) {
                continue
            }
            freq[stone] = freq[stone] + 1
        }
    }

    if (freq.white <= freq.black) {
        return 'white'
    }

    return 'black'
}


const to_key = ({ position, direction }: { position: Position, direction: Direction }): string => {
    return [position.x, position.y, direction].join("-")
}

const min_win_length = 5

export const to_wins = (board: Board): Position[][] => {
    const wins: Position[][] = []
    const visited = new Set<string>()
    for (const x_key in board) {
        for (const y_key in board[x_key]) {
            const x = Number(x_key)
            const y = Number(y_key)
            const stone = to_stone({ x, y }, board)

            if (!stone) {
                continue
            }

            for (const direction of Direction.all) {
                let current: Position = { x, y }

                if (visited.has(to_key({ position: current, direction }))) {
                    continue
                }

                const win: Position[] = [current]

                const vector = Direction.to_vector(direction)
                while (true) {
                    const next = Position.add(vector, current)
                    const next_stone = to_stone(next, board)
                    if (!next_stone) {
                        break
                    }
                    if (next_stone !== stone) {
                        break
                    }
                    win.push(next)
                    current = next
                }

                const opposite_vector = Position.rotate({ theta: 180, center: { x: 0, y: 0 }, position: vector })
                while (true) {
                    const next = Position.add(opposite_vector, current)
                    const next_stone = to_stone(next, board)
                    if (!next_stone) {
                        break
                    }
                    if (next_stone !== stone) {
                        break
                    }
                    win.push(next)
                    current = next
                }

                for (const position of win) {
                    visited.add(to_key({ position, direction }))
                }

                if (win.length >= min_win_length) {
                    wins.push(win)
                }

            }
        }
    }

    return wins
}

