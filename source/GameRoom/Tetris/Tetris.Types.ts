

// 
// 
// 
// Model
// 
// 
// 

import { Result } from "../../Core"


export type Model = {
    board: Board
    origin: Position
    piece: PieceName
}

export type Board = Cell[][]

export type Cell = "Empty" | "Filled"

export type Position = {
    x: number,
    y: number
}

export const pieces: Pieces = {
    I: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
    ],
    T: [{ x: 0, y: - 1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
    O: [

        { x: 0, y: - 1 }, { x: 1, y: - 1 },
        { x: 0, y: 0 }, { x: 1, y: 0 }],
    J: [

        { x: -1, y: -1 }, {
            x: -1, y: 0
        },
        { x: 0, y: 0 }, { x: 1, y: 0 }],
    L: [

        { x: 1, y: - 1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 }, { x: 1, y: 0 }],
    S: [

        { x: 0, y: - 1 },
        { x: 1, y: - 1 }, {
            x: -1, y: 0
        }, {
            x: 0, y: 0
        }],
    Z: [
        { x: -1, y: - 1 },
        { x: 0, y: - 1 },
        { x: 0, y: 0 }, { x: 1, y: 0 }],
}


export type Piece = Position[]

export type PieceName = "I" | "T" | "O" | "J" | "L" | "S" | "Z"

export type Pieces = {
    [piece in PieceName]: Piece
}

export const rotate = (position: Position): Position => {
    return {
        x: -position.y,
        y: position.x
    }
}

export const add = (a: Position, b: Position): Position => {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    }
}

export type Direction = "Down" | "Left" | "Right"

export const move = (direction: Direction, position: Position): Position => {
    switch (direction) {
        case 'Left': {
            return {
                x: position.x - 1,
                y: position.y
            }
        }

        case 'Right': {
            return {
                x: position.x + 1,
                y: position.y
            }
        }

        case 'Down': {
            return {
                x: position.x,
                y: position.y + 1
            }
        }
    }
}


const toPiece = (model: Model): Piece => {
    return pieces[model.piece].map(position => add(position, model.origin))
}

const toBoardCell = (position: Position, board: Board): Cell => {
    return board?.[position.x]?.[position.y] ?? "Filled"
}

export const isCollision = (model: Model): boolean => {
    return toPiece(model).every(position => toBoardCell(position, model.board) === "Empty")
}

// 
// 
// 
// 
// 
// 
// 

export type InputMove = ['InputMove', { direction: Direction }]
export type InputMove_Done = ['InputMove_Done', Result.Result<InputMoveProblem, Model>]
export type InputMoveProblem = "collision"

export const inputMove = ({ direction }: InputMove[1], model: Model): InputMove_Done[1] => {

    const modelNext: Model = {
        ...model,
        origin: move(direction, model.origin)
    }


    if (!isCollision(model)) {
        return Result.Err("collision")
    }

    return Result.Ok(modelNext)
}
