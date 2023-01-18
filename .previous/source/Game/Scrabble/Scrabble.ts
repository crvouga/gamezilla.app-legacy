import { UserId } from "../../Data"


// const length = 15

export type Model = {
    board: Board
    players: {
        [userId: UserId]: {
            userId: UserId
            tiles: Tile[]
        }
    }
}

export type Tile = "A" | 'B' | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"

export type Board = {
    [x: number]: {
        [y: number]: Tile
    }
}

export type Multiplier = 'TW' | 'DL' | 'DW'

export const multipliers: { [x: number]: { [y: number]: Multiplier } } = {
    1: { 1: 'TW', 4: 'DL', 8: 'TW', 12: 'DL', 15: 'TW' },
    2: { 2: 'DW', 6: 'DL', 11: 'DL', 14: 'DW' },
    15: { 1: 'TW', 4: 'DL', 8: 'TW', 12: 'DL', 15: 'TW' },
}

type Position = {
    x: number,
    y: number
}

export const score = (_positions: Position[], _board: Board): number => {
    return 0
}
