import { Columns, PlayerType, toStatus, findWins } from "./connect-four";
import { describe, expect, test } from "bun:test";
export const p1: PlayerType = "player-one";
export const p2: PlayerType = "player-two";
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
    [p1],
    [p2, p1],
    [p1, p2, p1],
    [p2, p1, p2, p1],
    [],
];
export const leftDiagonal: Columns = [
    [],
    [],
    [p2, p1, p2, p1],
    [p1, p2, p1],
    [p2, p1],
    [p1],
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
];
export const tie: Columns = [
    [p1, p2, p1, p2, p1, p2],
    [p1, p2, p1, p2, p1, p2],
    [p1, p2, p1, p2, p1, p2],
    [p2, p1, p2, p1, p2, p1],
    [p1, p2, p1, p2, p1, p2],
    [p1, p2, p1, p2, p1, p2],
    [p1, p2, p1, p2, p1, p2],
];
const winner = p1;
const expectWinner = (columns: Columns) => {
    const status = toStatus(columns);
    expect(status.type).toBe("Winner");
    if (status.type === "Winner") {
        expect(status.winner).toBe(winner);
    }
};
describe(import.meta.file, () => {
    test("detects horizontal win", () => {
        expectWinner(horizontal);
        expect(findWins(horizontal).length).toBe(1);
    });
    test("detects vertical win", () => {
        expectWinner(vertical);
        expect(findWins(vertical).length).toBe(1);
    });
    test("detects right diagonal win", () => {
        expectWinner(rightDiagonal);
        expect(findWins(rightDiagonal).length).toBe(1);
    });
    test("detects left diagonal win", () => {
        expectWinner(leftDiagonal);
        expect(findWins(leftDiagonal).length).toBe(1);
    });
    test("detects left and right diagonal win", () => {
        expectWinner(leftAndRightDiagonal);
        const wins = findWins(leftAndRightDiagonal);
        expect(wins.length).toBe(2);
    });
    test("detects wins longer than 4", () => {
        expectWinner(horizontalLongest);
        const wins = findWins(horizontalLongest);
        expect(wins.length).toBeGreaterThanOrEqual(1);
        // expect(wins.length).toBe(1)
        // const [win] = wins
        // if (win) {
        //     expect(win.length).toBe(horizontalLongest.length)
        // }
    });
    test("detects draw", () => {
        const status = toStatus(tie);
        expect(status.type).toBe("Tie");
    });
    test("detects left diagonal win", () => {
        const columns: Columns = [
            [],
            [p2, p1, p2, p1],
            [p2, p2, p1],
            [p1, p1, p2],
            [p1],
            [],
            [],
        ];
        const wins = findWins(columns);
        expect(wins.length).toBe(1);
    });
    test("detects diagonal", () => {
        const columns: Columns = [
            [],
            [p1],
            [p1, p1, p2],
            [p2, p2, p1],
            [p2, p1, p2, p1],
            [],
            [],
        ];
        const wins = findWins(columns);
        expect(wins.length).toBe(1);
    });
    test("detects right most vertical", () => {
        const columns: Columns = [
            [p2, p2, p2],
            [p1],
            [p2, p2, p1, p2],
            [p1, p1, p2, p1],
            [p2, p2, p1, p1, p2],
            [p1, p2, p2],
            [p1, p1, p1, p1],
        ];
        const wins = findWins(columns);
        expect(wins.length).toBe(1);
    });
    test("remove win subsets", () => {
        const columns: Columns = [
            [p1],
            [p1],
            [p1],
            [p1, p2, p2, p1, p2, p2],
            [p1, p2],
            [],
            [],
        ];
        const wins = findWins(columns);
        expect(wins.length).toBe(1);
        if (wins[0]) {
            expect(wins[0].length).toBe(5);
        }
    });
});
