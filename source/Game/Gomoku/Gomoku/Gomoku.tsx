import { Result, Ok, Err } from "../../../Core/Result"
import { SvgIcon } from "../../../UI"
import { Direction, Position } from "./Position"

export type Board = {
    [x: number]: {
        [y: number]: Stone,
    }
}

export const initBoard: Board = {}

export type BotLevel = "Easy" | "Medium" | "Hard"

export const botLevels: { [botLevel in BotLevel]: BotLevel } = {
    Easy: "Easy",
    Medium: "Medium",
    Hard: "Hard",
}

export type Stone = "white" | "black"

export const stones: { [stone in Stone]: Stone } = {
    white: "white",
    black: "black",
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

// 
// 
// view
// 
// 

const gameTheme = {
    whiteStone: "orange",
    blackStone: "blue",
    background: "#000",
    line: "#fff"
}

export const stoneToColor = (stone: Stone): string => {
    switch (stone) {
        case 'black':
            return gameTheme.blackStone

        case 'white':
            return gameTheme.whiteStone
    }
}

export const viewStoneIcon = ({ stone }: { stone: Stone }) => {
    return (
        <SvgIcon viewBox="-1 -1 2 2">
            <circle cx={0} cy={0} r={0.5} fill={stoneToColor(stone)} />
        </SvgIcon>
    )
}

export const viewCoverArt = () => {
    const columnCount = 6
    const rowCount = 6
    const viewBox = [0, 0, rowCount, columnCount].join(" ")
    return (
        <svg width={"100%"} viewBox={viewBox}>
            <rect x={0} y={0} width="100%" height="100%" fill="#000" />
            <g transform="translate(0.5, 0.5)">
                {Array.from({ length: columnCount }).map((_, x) => Array.from({ length: rowCount }).map((_, y) => (
                    <circle key={[x, y].join("-")} cx={x} cy={y} fill={gameTheme.line} r={0.1} />
                )))}
                <circle cx={3} cy={4} fill={gameTheme.whiteStone} r={0.45} />
                <circle cx={3} cy={3} fill={gameTheme.blackStone} r={0.45} />
                <circle cx={2} cy={3} fill={gameTheme.whiteStone} r={0.45} />
                <circle cx={2} cy={2} fill={gameTheme.blackStone} r={0.45} />
                <circle cx={3} cy={2} fill={gameTheme.whiteStone} r={0.45} />
            </g>
        </svg>
    )
}

const viewBox = [
    bounds.lower.x,
    bounds.lower.y,
    bounds.upper.x - bounds.lower.x,
    bounds.upper.y - bounds.lower.y,
].join(" ")



export const viewBoard = () => {
    return (
        <svg viewBox={viewBox}>
            <rect x={0} y={0} width="100%" height="100%" fill="#000" />

        </svg>
    )
}