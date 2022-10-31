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
        expect(toWins(horizontal).length).toBe(1)
    })

    it("detects vertical win", () => {
        expectWinner(vertical)
        expect(toWins(vertical).length).toBe(1)
    })

    it("detects right diagonal win", () => {
        expectWinner(rightDiagonal)
        expect(toWins(rightDiagonal).length).toBe(1)
    })


    it("detects left diagonal win", () => {
        expectWinner(leftDiagonal)
        expect(toWins(leftDiagonal).length).toBe(1)
    })

    it("detects left and right diagonal win", () => {
        expectWinner(leftAndRightDiagonal)

        const wins = toWins(leftAndRightDiagonal)

        expect(wins.length).toBe(2)
    })

    it("detects wins longer than 4", () => {
        expectWinner(horizontalLongest)

        const wins = toWins(horizontalLongest)

        expect(wins.length).toBeGreaterThanOrEqual(1)

        // expect(wins.length).toBe(1)

        // const [win] = wins

        // if (win) {
        //     expect(win.length).toBe(horizontalLongest.length)
        // }
    })

    it("detects draw", () => {
        const status = toStatus(tie)
        expect(status.type).toBe("Tie")
    })

    it("detects left diagonal win", () => {
        const columns: Columns = [
            [],
            ['PlayerTwo', 'PlayerOne', 'PlayerTwo', 'PlayerOne'],
            ['PlayerTwo', 'PlayerTwo', 'PlayerOne'],
            ['PlayerOne', 'PlayerOne', 'PlayerTwo'],
            ['PlayerOne'],
            [],
            []
        ]

        const wins = toWins(columns)

        expect(wins.length).toBe(1)
    })

    it("detects diagonal", () => {
        const columns: Columns = [
            [],
            ['PlayerOne'],
            ['PlayerOne', 'PlayerOne', 'PlayerTwo'],
            ['PlayerTwo', 'PlayerTwo', 'PlayerOne'],
            ['PlayerTwo', 'PlayerOne', 'PlayerTwo', 'PlayerOne'],
            [],
            []
        ]

        const wins = toWins(columns)

        expect(wins.length).toBe(1)
    })


    it("detects right most vertical", () => {
        const columns: Columns = [
            ['PlayerTwo', 'PlayerTwo', 'PlayerTwo'],
            ['PlayerOne'],
            ['PlayerTwo', 'PlayerTwo', 'PlayerOne', 'PlayerTwo'],
            ['PlayerOne', 'PlayerOne', 'PlayerTwo', 'PlayerOne'],
            ['PlayerTwo', 'PlayerTwo', 'PlayerOne', 'PlayerOne', 'PlayerTwo'],
            ['PlayerOne', 'PlayerTwo', 'PlayerTwo'],
            ['PlayerOne', 'PlayerOne', 'PlayerOne', 'PlayerOne']
        ]

        const wins = toWins(columns)

        expect(wins.length).toBe(1)
    })

})


export { };
