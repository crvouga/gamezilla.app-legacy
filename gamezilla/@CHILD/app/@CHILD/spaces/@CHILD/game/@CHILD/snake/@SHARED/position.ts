export type Position = {
    x: number
    y: number
}

const range = ({
    lower,
    upper,
}: {
    lower: Position
    upper: Position
}): Position[] => {
    const positions: Position[] = []

    for (let x = lower.x; x < upper.x; x++) {
        for (let y = lower.y; y < upper.y; y++) {
            positions.push({ x, y })
        }
    }

    return positions
}

const add = (a: Position, b: Position): Position => {
    return { x: a.x + b.x, y: a.y + b.y }
}

const subtract = (a: Position, b: Position): Position => {
    return { x: a.x - b.x, y: a.y - b.y }
}

const scale = (scaleFactor: Position, a: Position): Position => {
    return { x: a.x * scaleFactor.x, y: a.y * scaleFactor.y }
}

const equals = (a: Position, b: Position): boolean => {
    return a.x === b.x && a.y === b.y
}

const map = (f: (v: number) => number, a: Position): Position => {
    return { x: f(a.x), y: f(a.y) }
}

const distance = (a: Position, b: Position): number => {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
}

export const Position = {
    range,
    add,
    subtract,
    scale,
    equals,
    map,
    distance,
}
