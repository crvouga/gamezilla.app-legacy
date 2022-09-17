import { UserId } from "../../Data"


// 
// 
// 
// Model
// 
// 
// 


export type SharedModel = {
    maze: Maze
    players: {
        [userId: UserId.UserId]: {
            userId: UserId.UserId
        }
    }
}

export type FrontendModel = SharedModel

export type BackendModel = SharedModel

export type Maze = Cell[][]

export type Cell = {
    hasTop: boolean,
    hasLeft: boolean
}

// 
// 
// 
// Init
// 
// 
// 

export const initMaze = ({ columnCount, rowCount }: { columnCount: number, rowCount: number }): Maze => {
    const maze: Cell[][] = []

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const column: Cell[] = []

        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            column.push({ hasLeft: true, hasTop: true, })
        }

        maze.push(column)
    }

    return maze

}

