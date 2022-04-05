import React from "react";
import { Platform } from "react-native";
import { Title } from "react-native-paper";
import Svg, { Circle, G, Line, Rect } from "react-native-svg";

import {
  IBoard,
  toStatus,
  allPositions,
  IColumn,
  IRow,
  IAction,
  actions,
} from "./tic-tac-toe";

export const ViewTicTacToe = ({
  dispatch,
  board,
}: {
  board: IBoard;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <Title style={{ textAlign: "center", padding: 8 }}>
        {toStatus({ board })}
      </Title>
      <TicTacToeBoard
        board={board}
        onPress={(column, row) => {
          dispatch(actions.boardPressed({ column, row }));
        }}
      />
    </>
  );
};
const LINES = [
  { x1: 1, y1: 0, x2: 1, y2: 3 },
  { x1: 2, y1: 0, x2: 2, y2: 3 },
  { x1: 0, y1: 1, x2: 3, y2: 1 },
  { x1: 0, y1: 2, x2: 3, y2: 2 },
] as const;

export const TicTacToeBoard = ({
  board,
  onPress,
}: {
  board: IBoard;
  onPress: (column: IColumn, row: IRow) => void;
}) => {
  return (
    <Svg width="100%" viewBox="0 0 3 3">
      {LINES.map((line, index) => (
        <Line key={index} {...line} stroke="white" strokeWidth={0.1} />
      ))}

      {allPositions.map(({ column, row }) => (
        <>
          <Rect
            key={`${column} ${row}`}
            x={Number(column)}
            y={Number(row)}
            width={1}
            height={1}
            fill="transparent"
            {...(Platform.OS === "web"
              ? {
                  onClick: () => {
                    onPress(column, row);
                  },
                }
              : {
                  onPress: () => {
                    onPress(column, row);
                  },
                })}
          />
          {board[column][row] === "X" && (
            <G
              transform={`translate(${-0.5}, ${-0.5}) scale(0.8) translate(${0.5}, ${0.5}) translate(${column}, ${row})`}
            >
              <Line
                x1={0}
                y1={0}
                x2={1}
                y2={1}
                stroke="white"
                strokeWidth={0.1}
              />
              <Line
                x1={1}
                y1={0}
                x2={0}
                y2={1}
                stroke="white"
                strokeWidth={0.1}
              />
            </G>
          )}
          {board[column][row] === "O" && (
            <Circle
              r={0.3}
              cx={Number(column) + 0.5}
              cy={Number(row) + 0.5}
              stroke="white"
              strokeWidth={0.1}
              fill="transparent"
            />
          )}
        </>
      ))}
    </Svg>
  );
};
