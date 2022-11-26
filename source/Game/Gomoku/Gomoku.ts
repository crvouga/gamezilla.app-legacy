import { Result, Ok, Err } from "../../Core/Result"

export type Board = {
    [x: number]: {
        [y: number]: Stone,
    }
}

type Stone = "white" | "black"

type Position = {
    x: number,
    y: number
}

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

    const boardNew = setStone(position, stone, board)

    return Ok(boardNew)
}

const setStone = (position: Position, stone: Stone, board: Board): Board => {
    return {
        ...board,
        [position.x]: {
            ...board[position.x],
            [position.y]: stone
        }
    }
}

const toTurn = (board: Board): Stone => {
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


export const toWins = (board: Board): Position[][] => {



    for (const x in board) {
        for (const y in board[x]) {
            const stone = board[Number(x)]?.[Number(y)]
            if (!stone) {
                continue
            }
        }
    }

    return []
}