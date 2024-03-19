import { P } from "gamezilla-app/@SHARED/parsing";
export type Position = {
    x: number;
    y: number;
};
const to = (x: unknown): Position | null => {
    if (P.obj(x) && P.has(x, "x", P.num) && P.has(x, "y", P.num)) {
        return x;
    }
    return null;
};
const is = P.is(to);
const distance = (a: Position, b: Position) => {
    return Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2);
};
export const Position = {
    distance,
    is,
    to,
};
export const DELTAS: Position[] = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
];
