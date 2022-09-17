import { Result } from "../../Core"
import * as Board from "./Board"
import * as Direction from "./Direction"
import * as Position from "./Position"
import * as Tetromino from "./Tetromino"

// 
// 
// 
// Model
// 
// 
// 


export type Model = {
    board: Board.Board
    origin: Position.Position
    tetrominoName: Tetromino.Name
}


export const columnCount = 10
export const rowCount = 20
const initialOrigin: Position.Position = { x: Math.floor(columnCount / 2), y: 1 }

export const toTetromino = (model: Model): Tetromino.Tetromino => {
    return Tetromino.toUnit(model.tetrominoName).map(position => Position.add(position, model.origin))
}

export const inCollision = (model: Model): boolean => {
    return toTetromino(model).every(position => Board.toCell(position, model.board) === "Empty")
}

// 
// 
// 
// 
// 
// 
// 

export type InputMove = ['InputMove', { direction: Direction.Direction }]
export type InputMove_Done = ['InputMove_Done', Result.Result<InputMoveProblem, Model>]
export type InputMoveProblem = "collision"

export const inputMove = ({ direction }: InputMove[1], model: Model): InputMove_Done[1] => {
    const originNext = Position.add(Direction.toPosition(direction), model.origin)

    const modelNext: Model = {
        ...model,
        origin: originNext,
    }


    if (!inCollision(model)) {
        return Result.Err("collision")
    }

    return Result.Ok(modelNext)
}

// 
// 
// 
// 
// 
// 
// 


export type Ticked = ["Ticked"]

export const ticked = (model: Model): Model => {
    const originNext = Position.add(Direction.toPosition("Down"), model.origin)

    const modelNext: Model = {
        ...model,
        origin: originNext
    }


    if (inCollision(model)) {
        const tetromino = toTetromino(model)

        const boardNew = tetromino.reduce((board, position) => Board.setCell(position, "Filled", board), model.board)

        return {
            ...model,
            origin: initialOrigin,
            tetrominoName: "Z",
            board: boardNew
        }
    }

    return modelNext
}


