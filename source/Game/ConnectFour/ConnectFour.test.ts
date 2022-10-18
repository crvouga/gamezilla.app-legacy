import { Columns, PlayerType, toStatus, toWins } from "./ConnectFour";

const p1: PlayerType = "PlayerOne"
const p2: PlayerType = "PlayerTwo"

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

describe("Connect Four", () => {
    it("detects horizontal win", () => {
        expectWinner(horizontal, p1)
        expect(toWins(horizontal).length).toEqual(1)
    })

    it("detects vertical win", () => {
        expectWinner(vertical, p1)
        expect(toWins(vertical).length).toEqual(1)
    })

    it("detects right diagonal win", () => {
        expectWinner(rightDiagonal, p1)
        expect(toWins(rightDiagonal).length).toEqual(1)
    })


    it("detects left diagonal win", () => {
        expectWinner(leftDiagonal, p1)
        expect(toWins(leftDiagonal).length).toEqual(1)
    })

    it("detects left and right diagonal win", () => {
        expectWinner(leftAndRightDiagonal, p1)

        const wins = toWins(leftAndRightDiagonal)

        expect(wins.length).toEqual(2)
    })

    it("detects wins longer than 4", () => {
        expectWinner(horizontalLongest, p1)

        const wins = toWins(horizontalLongest)

        expect(wins.length).toEqual(1)

        const [win] = wins

        if (win) {
            expect(win.length).toEqual(horizontalLongest.length)
        }
    })

})

const expectWinner = (columns: Columns, winner: PlayerType) => {
    const status = toStatus(columns)

    expect(status.type).toBe("Winner")

    if (status.type === 'Winner') {
        expect(status.winner).toBe(winner)
    }
}

export { };
