import { Columns, PlayerType } from "./ConnectFour";

export const p1: PlayerType = "PlayerOne"
export const p2: PlayerType = "PlayerTwo"

export const winner: PlayerType = p1

export const horizontal: Columns = [
    [],
    [],
    [p1, p2],
    [p1, p2],
    [p1, p2],
    [p1],
    [],
];

export const vertical: Columns = [
    [],
    [],
    [p1, p1, p1, p1],
    [p2, p2, p2],
    [],
    [],
    [],
];

export const rightDiagonal: Columns = [
    [],
    [],
    [p1,],
    [p2, p1,],
    [p1, p2, p1],
    [p2, p1, p2, p1],
    [],
];

export const leftDiagonal: Columns = [
    [],
    [],
    [p2, p1, p2, p1],
    [p1, p2, p1],
    [p2, p1,],
    [p1,],
    [],
];

export const leftAndRightDiagonal: Columns = [
    [],
    [p1],
    [p2, p1, p2, p1],
    [p1, p2, p1],
    [p2, p1, p2, p1],
    [p1],
    [],
];

export const horizontalLongest: Columns = [
    [p1, p2],
    [p1, p2],
    [p1, p2],
    [p1],
    [p1, p2],
    [p1, p2],
    [p1, p2],
]

export const tie: Columns = [
    [p1, p2, p1, p2, p1, p2],
    [p1, p2, p1, p2, p1, p2],
    [p1, p2, p1, p2, p1, p2],
    [p2, p1, p2, p1, p2, p1],
    [p1, p2, p1, p2, p1, p2],
    [p1, p2, p1, p2, p1, p2],
    [p1, p2, p1, p2, p1, p2],
]