import * as Position from "./Position"

export type Tetromino = Position.Position[]

export type Name = "I" | "T" | "O" | "J" | "L" | "S" | "Z"

export const allNames: Name[] = ['I', 'T', 'O', 'J', "L", "S", "Z"]

export const tetrominos: { [name in Name]: Tetromino } = {
    I: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
    ],
    T: [
        { x: 0, y: - 1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 }
    ],
    O: [
        { x: 0, y: -1 },
        { x: 1, y: -1 },
        { x: 0, y: 0 },
        { x: 1, y: 0 }],
    J: [

        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 }
    ],
    L: [
        { x: 1, y: - 1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 }
    ],
    S: [

        { x: 0, y: - 1 },
        { x: 1, y: - 1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 }
    ],
    Z: [
        { x: -1, y: - 1 },
        { x: 0, y: - 1 },
        { x: 0, y: 0 },
        { x: 1, y: 0 }
    ],
}


export const toUnit = (name: Name): Tetromino => {
    return tetrominos[name]
}


export const View = ({ name }: { name: Name }) => {
    switch (name) {
        case 'I': {
            return <></>
        }

        case 'J': {
            return <></>
        }

        case 'L': {
            return <></>
        }

        case 'O': {
            return <></>
        }

        case 'S': {
            return <></>
        }

        case 'T': {
            return <></>
        }

        case 'Z': {
            return <></>
        }
    }
}