import React from "react";
import { defaultTheme } from "./tic-tac-toe-board-theme";
import {
  BoardPosition,
  toBoardLines,
  toBoardPositions,
} from "./tic-tac-toe-board-utility";

export type BoardMove = {
  row: number;
  column: number;
  player: "x" | "o";
};

const theme = defaultTheme;

export default function TicTacToeBoard({
  rowCount,
  columnCount,
  onClick,
  moves,
}: {
  rowCount: number;
  columnCount: number;
  moves: BoardMove[];

  onClick: (position: BoardPosition) => void;
}) {
  return (
    <>
      <svg width="100%" viewBox={`0 0 ${columnCount} ${rowCount}`}>
        <g strokeWidth={0.1} stroke="black">
          {toBoardLines({ rowCount, columnCount }).map((line) => (
            <line
              key={JSON.stringify(line)}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
            />
          ))}
        </g>

        <g>
          {moves.map(({ player, row, column }, index) => (
            <g key={index} transform={`translate(${column}, ${row})`}>
              {player === "x" && (
                <g strokeWidth={0.1} stroke={theme.x}>
                  <line x1={0} y1={0} x2={1} y2={1} />
                  <line x1={1} y1={0} x2={0} y2={1} />
                </g>
              )}
              {player === "o" && (
                <g strokeWidth={0.1} stroke={theme.o}>
                  <circle fill="transparent" cx={1 / 2} cy={1 / 2} r={1 / 2} />
                </g>
              )}
            </g>
          ))}
        </g>

        <g fill="transparent">
          {toBoardPositions({ rowCount, columnCount }).map((position) => (
            <rect
              key={JSON.stringify(position)}
              x={position.column}
              y={position.row}
              width={1}
              height={1}
              onClick={() => onClick(position)}
            />
          ))}
        </g>
      </svg>
    </>
  );
}
