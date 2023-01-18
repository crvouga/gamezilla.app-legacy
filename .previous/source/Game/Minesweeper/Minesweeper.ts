export type Model = {
    flags: Position[]
    mines: Position[]
    digs: Position[]
    bounds: Bounds
}

type Position = {
    x: number
    y: number
}

type Bounds = {
    upper: Position
    lower: Position
}

export const toSlotCount = (position: Position, model: Model): number => {
    let count = 0

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (model.mines.some(mine => mine.x === position.x + dx && mine.y === position.y + dy)) {
                count = count + 1
            }
        }
    }

    return count
}