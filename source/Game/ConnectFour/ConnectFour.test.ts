import { Columns, toStatus, toWins } from "./ConnectFour";
import { horizontal, horizontalLongest, leftAndRightDiagonal, leftDiagonal, rightDiagonal, tie, vertical, winner } from "./test-data";

const expectWinner = (columns: Columns) => {
    const status = toStatus(columns)

    expect(status.type).toBe("Winner")

    if (status.type === 'Winner') {
        expect(status.winner).toBe(winner)
    }
}

describe("Connect Four", () => {
    it("detects horizontal win", () => {
        expectWinner(horizontal)
        expect(toWins(horizontal).length).toEqual(1)
    })

    it("detects vertical win", () => {
        expectWinner(vertical)
        expect(toWins(vertical).length).toEqual(1)
    })

    it("detects right diagonal win", () => {
        expectWinner(rightDiagonal)
        expect(toWins(rightDiagonal).length).toEqual(1)
    })


    it("detects left diagonal win", () => {
        expectWinner(leftDiagonal)
        expect(toWins(leftDiagonal).length).toEqual(1)
    })

    it("detects left and right diagonal win", () => {
        expectWinner(leftAndRightDiagonal)

        const wins = toWins(leftAndRightDiagonal)

        expect(wins.length).toEqual(2)
    })

    it("detects wins longer than 4", () => {
        expectWinner(horizontalLongest)

        const wins = toWins(horizontalLongest)

        expect(wins.length).toEqual(1)

        const [win] = wins

        if (win) {
            expect(win.length).toEqual(horizontalLongest.length)
        }
    })

    it("detects draw", () => {
        const status = toStatus(tie)
        expect(status.type).toEqual("Tie")
    })

})


export { };
