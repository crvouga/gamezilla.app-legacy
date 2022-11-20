
export type Position = {
    x: number,
    y: number
}

const add = (a: Position, b: Position): Position => {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    }
}

const range = (bounds: { x: number, y: number }): Position[] => {
    const positions: Position[] = []

    for (let x = 0; x < bounds.x; x++) {
        for (let y = 0; y < bounds.y; y++) {
            positions.push({ x, y })
        }
    }

    return positions
}

export const Position = {
    add,
    range
}