export type Position = {
    x: number,
    y: number
}

export type Direction = "vertical" | "horizontal" | "left_diagonal" | "right_diagonal"

const directions: { [direction in Direction]: Direction } = {
    vertical: "vertical",
    horizontal: "horizontal",
    left_diagonal: "left_diagonal",
    right_diagonal: "right_diagonal"
}

const to_vector = (direction: Direction): Position => {
    switch (direction) {
        case 'horizontal': {
            return { x: 1, y: 0 }
        }

        case 'vertical': {
            return { x: 0, y: 1 }
        }

        case 'left_diagonal': {
            return { x: 1, y: 1 }
        }

        case 'right_diagonal': {
            return { x: 1, y: -1 }
        }
    }
}

export const Direction = {
    all: Object.values(directions),
    to_vector,
}

// source:https://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript 
const rotate = ({ theta, center: { x: cx, y: cy }, position: { x, y } }: { theta: number, center: Position, position: Position }): Position => {
    return {
        x: (x - cx) * Math.cos(theta) - (y - cy) * Math.sin(theta) + cx,
        y: (y - cy) * Math.cos(theta) + (x - cx) * Math.sin(theta) + cy
    }
}

const add = (a: Position, b: Position): Position => {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    }
}

export const Position = {
    rotate,
    add,
}