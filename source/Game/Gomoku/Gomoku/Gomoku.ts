import { Result, Ok, Err } from "../../../Core/Result"
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

const inBounds = (position: Position): boolean => {
    return bounds.lower.x <= position.x && position.x <= bounds.upper.x && bounds.lower.y <= position.y && position.y <= bounds.upper.y
}

export const move = ({ position, stone, board }: { position: Position, stone: Stone, board: Board }): Result<MoveProblem, Board> => {
    if (!inBounds(position)) {
        return Err("out_of_bounds")
    }

    const turn = toTurn(board)


    if (turn !== stone) {
        return Err("not_turn")
    }

    const board_new = setStone(position, stone, board)

    return Ok(board_new)
}

export const setStone = (position: Position, stone: Stone, board: Board): Board => {
    return {
        ...board,
        [position.x]: {
            ...board[position.x],
            [position.y]: stone
        }
    }
}

const toStone = (position: Position, board: Board): Stone | null => {
    return board[position.x]?.[position.y] ?? null
}


const toTurn = (board: Board): Stone => {
    const freq = { black: 0, white: 0 }

    for (const xKey in board) {
        for (const yKey in board[xKey]) {
            const x = Number(xKey)
            const y = Number(yKey)
            const stone = toStone({ x, y }, board)
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


const toKey = ({ position, direction }: { position: Position, direction: Direction }): string => {
    return [position.x, position.y, direction].join("-")
}

const minWinLength = 5

export const toWins = (board: Board): Position[][] => {
    const wins: Position[][] = []
    const visited = new Set<string>()
    for (const xKey in board) {
        for (const yKey in board[xKey]) {
            const x = Number(xKey)
            const y = Number(yKey)
            const stone = toStone({ x, y }, board)

            if (!stone) {
                continue
            }

            for (const direction of Direction.all) {
                let current: Position = { x, y }

                if (visited.has(toKey({ position: current, direction }))) {
                    continue
                }

                const win: Position[] = [current]

                const vector = Direction.toVector(direction)

                while (true) {
                    const next = Position.add(vector, current)
                    const nextStone = toStone(next, board)
                    if (!nextStone) {
                        break
                    }
                    if (nextStone !== stone) {
                        break
                    }
                    win.push(next)
                    current = next
                }

                const oppositeVector = Position.rotate({ theta: 180, center: { x: 0, y: 0 }, position: vector })
                while (true) {
                    const next = Position.add(oppositeVector, current)
                    const nextStone = toStone(next, board)
                    if (!nextStone) {
                        break
                    }
                    if (nextStone !== stone) {
                        break
                    }
                    win.push(next)
                    current = next
                }

                for (const position of win) {
                    visited.add(toKey({ position, direction }))
                }

                if (win.length >= minWinLength) {
                    wins.push(win)
                }

            }
        }
    }

    return wins
}

