import * as Position from "./Position"

// 
// 
// 
// Model
// 
// 
// 

export type Board = Cell[][]

export type Cell = "Empty" | "Filled"

export const init = ({ columnCount, rowCount }: { columnCount: number, rowCount: number }): Board => {
    return repeat(columnCount, repeat(rowCount, "Empty"))
}

export const toCell = (position: Position.Position, board: Board): Cell => {
    return board?.[position.x]?.[position.y] ?? "Filled"
}

export const setCell = (position: Position.Position, cellNext: Cell, board: Board): Board => {
    return board.map((column, x) => column.map((cell, y) => position.x === x && position.y === y ? cellNext : cell))
}

// 
// 
// 
// Utils
// 
// 
// 

const repeat = <T>(count: number, x: T): T[] => {
    const y: T[] = []
    for (let i = 0; i < count; i++) {
        y.push(x)
    }
    return y
}
