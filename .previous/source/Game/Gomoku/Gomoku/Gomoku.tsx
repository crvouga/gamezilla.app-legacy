import { NonEmpty, shuffle } from "../../../Core"
import { Err, Ok, Result } from "../../../Core/Result"
import { SvgIcon, Sx } from "../../../UI"
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

export const toOppositeStone = (stone: Stone): Stone => {
    switch (stone) {
        case 'black': {
            return 'white'
        }

        case 'white': {
            return 'black'
        }
    }
}


type Bounds = {
    lower: Position,
    upper: Position
}

export const bounds: Bounds = {
    lower: {
        x: 0,
        y: 0,
    },
    upper: {
        x: 15,
        y: 15,
    }
}

const allPositions = Position.rangeExclusive(bounds)


export type MoveProblem = "out_of_bounds" | "not_turn" | "position_occupied" | "game_over"

const inBounds = (position: Position): boolean => {
    return bounds.lower.x <= position.x && position.x <= bounds.upper.x && bounds.lower.y <= position.y && position.y <= bounds.upper.y
}

export const move = ({ position, stone, board }: { position: Position, stone: Stone, board: Board }): Result<MoveProblem, Board> => {
    if (!inBounds(position)) {
        return Err("out_of_bounds")
    }

    const status = toStatus(board)

    if (status.type === 'win') {
        return Err("game_over")
    }

    if (status.type === 'draw') {
        return Err("game_over")
    }

    if (status.turn !== stone) {
        return Err("not_turn")
    }

    if (toStone(position, board)) {
        return Err("position_occupied")
    }

    const boardNew = setStone(position, stone, board)

    return Ok(boardNew)
}



export const toBestMove = ({ stone, board }: { stone: Stone, board: Board }) => {
    for (const position of shuffle(allPositions)) {
        const moved = move({ position, stone, board })
        if (moved.type === 'Ok') {
            return position
        }
    }
    return null
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


export const toTurn = (board: Board): Stone => {
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



export const toStatus = (board: Board) => {
    const wins = toWins(board)

    if (NonEmpty.is(wins)) {
        return {
            type: 'win',
            wins,
            winner: wins[0].stone
        } as const
    }

    if (isDraw(board)) {
        return {
            type: 'draw',
        } as const
    }

    const turn = toTurn(board)

    return {
        type: 'game',
        turn
    } as const
}

const isDraw = (board: Board) => {
    return allPositions.every(position => toStone(position, board) !== null)
}


const minWinLength = 5

export type Win = {
    stone: Stone;
    positions: Position[]
}

export const toWins = (board: Board): Win[] => {
    const toKey = ({ position, direction }: { position: Position, direction: Direction }): string => {
        return [position.x, position.y, direction].join("-")
    }

    const wins: Win[] = []
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
                    wins.push({
                        stone,
                        positions: win
                    })
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
    whiteStone: "white",
    blackStone: "black",
    background: "#C88655",
    line: "#232323",
}

export const stoneToColor = (stone: Stone): string => {
    switch (stone) {
        case 'black':
            return gameTheme.blackStone

        case 'white':
            return gameTheme.whiteStone
    }
}

export const viewStoneIcon = ({ stone, ...sx }: { stone: Stone } & Sx) => {
    return (
        <SvgIcon viewBox="-1 -1 2 2" sx={{ ...sx, }}>
            <circle cx={0} cy={0} r={0.9} fill={stoneToColor(stone)} strokeWidth={0.1} stroke="#454545" />
        </SvgIcon>
    )
}

export const viewCoverArt = () => {
    return (
        viewBoard({
            board: {
                2: { 2: 'black', 3: 'white' },
                3: { 2: 'black', 3: 'white', },
                4: { 2: 'white', 3: 'black' },

            },
            viewBoxOffset: 0.5,
            bounds: {
                lower: { x: 0, y: 0 },
                upper: { x: 6, y: 6 }
            },
        })
    )
}





export const viewBoard = ({ board, onPress, bounds: bounds_ = bounds, viewBoxOffset = 0.8 }: { board: Board, onPress?: (position: Position) => void, bounds?: Bounds, viewBoxOffset?: number }) => {


    const boundsView = {
        lower: {
            x: bounds_.lower.x - viewBoxOffset,
            y: bounds_.lower.y - viewBoxOffset,
        },
        upper: {
            x: bounds_.upper.x - 1 + viewBoxOffset,
            y: bounds_.upper.y - 1 + viewBoxOffset,
        }
    }

    const width = boundsView.upper.x - boundsView.lower.x
    const height = boundsView.upper.y - boundsView.lower.y

    const viewBox = [boundsView.lower.x, boundsView.lower.y, width, height].join(" ")



    return (
        <svg style={{ overflow: "hidden" }} width="100%" viewBox={viewBox}>
            <g strokeWidth={0.05}>
                <rect x={boundsView.lower.x} y={boundsView.lower.y} width={width} height={height} fill={gameTheme.background} />


                <g stroke={gameTheme.line}>
                    <rect
                        x={bounds_.lower.x}
                        y={bounds_.lower.y}
                        width={bounds_.upper.x - 1 - bounds_.lower.x}
                        height={bounds_.upper.y - 1 - bounds_.lower.y}
                        fill={gameTheme.background}
                    />
                    {rangeInclusive({ lower: 1, upper: bounds_.upper.y - 1 }).map(x => (
                        <line key={`x${x}`} x1={x} y1={bounds_.lower.y} x2={x} y2={bounds_.upper.y - 1} />
                    ))}

                    {rangeInclusive({ lower: 1, upper: bounds.upper.x - 1 }).map(y => (
                        <line key={`y${y}`} x1={bounds_.lower.x} y1={y} x2={bounds_.upper.x - 1} y2={y} />
                    ))}
                </g>


                <g>
                    {allPositions.map(({ x, y }) => {
                        const stone = toStone({ x, y }, board)
                        if (!stone) {
                            return (
                                <circle
                                    key={[x, y].join("-")}
                                    onMouseDown={onPress ? () => {
                                        onPress({ x, y })
                                    } : undefined}
                                    cx={x}
                                    cy={y}
                                    r={1 / 2}
                                    fill="transparent"
                                    stroke="none"
                                    style={onPress ? { cursor: "pointer" } : { cursor: "default" }}
                                />
                            )
                        }

                        return (
                            <circle
                                key={[x, y, stone].join("-")}
                                cx={x}
                                cy={y}
                                r={0.45}
                                fill={stoneToColor(stone)}
                            />
                        )
                    })}
                </g>
            </g>
        </svg>
    )
}

const rangeInclusive = ({ lower, upper }: { lower: number, upper: number }): number[] => {
    const range: number[] = []
    for (let n = lower; n <= upper; n++) {
        range.push(n)
    }
    return range
}