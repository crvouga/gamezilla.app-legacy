import React from "react";
import {
  BoardPosition,
  toBoardLines,
  toBoardPositions,
} from "./tic-tac-toe-board-utility";

export default function TicTacToeBoard({
  rowCount,
  columnCount,
  onClick,
}: {
  rowCount: number;
  columnCount: number;
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
