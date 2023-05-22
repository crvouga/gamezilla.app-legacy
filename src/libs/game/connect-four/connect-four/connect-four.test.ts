import { Columns, PlayerType, toStatus, toWins } from "./connect-four";
import { expect, describe, it } from "@jest/globals";

const expectWinner = (columns: Columns) => {
  const status = toStatus(columns);

  expect(status.type).toBe("Winner");

  if (status.type === "Winner") {
    expect(status.winner).toBe(winner);
  }
};

describe("Connect Four", () => {
  it("detects horizontal win", () => {
    expectWinner(horizontal);
    expect(toWins(horizontal).length).toBe(1);
  });

  it("detects vertical win", () => {
    expectWinner(vertical);
    expect(toWins(vertical).length).toBe(1);
  });

  it("detects right diagonal win", () => {
    expectWinner(rightDiagonal);
    expect(toWins(rightDiagonal).length).toBe(1);
  });

  it("detects left diagonal win", () => {
    expectWinner(leftDiagonal);
    expect(toWins(leftDiagonal).length).toBe(1);
  });

  it("detects left and right diagonal win", () => {
    expectWinner(leftAndRightDiagonal);

    const wins = toWins(leftAndRightDiagonal);

    expect(wins.length).toBe(2);
  });

  it("detects wins longer than 4", () => {
    expectWinner(horizontalLongest);

    const wins = toWins(horizontalLongest);

    expect(wins.length).toBeGreaterThanOrEqual(1);

    // expect(wins.length).toBe(1)

    // const [win] = wins

    // if (win) {
    //     expect(win.length).toBe(horizontalLongest.length)
    // }
  });

  it("detects draw", () => {
    const status = toStatus(tie);
    expect(status.type).toBe("Tie");
  });

  it("detects left diagonal win", () => {
    const columns: Columns = [
      [],
      [p2, p1, p2, p1],
      [p2, p2, p1],
      [p1, p1, p2],
      [p1],
      [],
      [],
    ];

    const wins = toWins(columns);

    expect(wins.length).toBe(1);
  });

  it("detects diagonal", () => {
    const columns: Columns = [
      [],
      [p1],
      [p1, p1, p2],
      [p2, p2, p1],
      [p2, p1, p2, p1],
      [],
      [],
    ];

    const wins = toWins(columns);

    expect(wins.length).toBe(1);
  });

  it("detects right most vertical", () => {
    const columns: Columns = [
      [p2, p2, p2],
      [p1],
      [p2, p2, p1, p2],
      [p1, p1, p2, p1],
      [p2, p2, p1, p1, p2],
      [p1, p2, p2],
      [p1, p1, p1, p1],
    ];

    const wins = toWins(columns);

    expect(wins.length).toBe(1);
  });
});

export const p1: PlayerType = "PlayerOne";
export const p2: PlayerType = "PlayerTwo";

export const winner: PlayerType = p1;

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
