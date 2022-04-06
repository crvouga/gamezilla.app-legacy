import React from "react";
import { Platform } from "react-native";
import { IconButton, Title } from "react-native-paper";

import Svg, { Circle, G, Line, Rect } from "react-native-svg";
import { AppBar, AppBarBackAction, Button, spacing } from "../../ui";
import {
  actions,
  ALL_POSSIBLE_POSITIONS,
  IAction,
  IBoard,
  IPosition,
  ISlot,
  toStatus,
  toTurn,
} from "./tic-tac-toe";

const toStatusText = (board: IBoard): string => {
  const status = toStatus(board);

  switch (status.type) {
    case "Tie":
      return `Tie`;

    case "Initial":
      return `${toTurn(board)} turn`;

    case "Playing":
      return `${toTurn(board)} turn`;

    case "Win":
      return `${status.winner} won`;
  }
};

export const TicTacToeView = ({
  dispatch,
  board,
  onBack,
  onStop,
}: {
  board: IBoard;
  dispatch: (action: IAction) => void;
  onBack: () => void;
  onStop: () => void;
}) => {
  return (
    <>
      <AppBar
        left={<AppBarBackAction onPress={onBack} />}
        title={"Tic Tac Toe"}
        right={<IconButton icon={"power"} onPress={onStop} />}
      />

      <Title style={{ textAlign: "center", padding: 8 }}>
        {toStatusText(board)}
      </Title>

      <TicTacToeBoard
        board={board}
        onPress={(position) => {
          dispatch(actions.boardPressed(position));
        }}
      />
      <Button
        labelStyle={{ padding: spacing(1) }}
        disabled={toStatus(board).type === "Initial"}
        color={theme.background}
        title="Restart game"
        onPress={() => {
          dispatch(actions.restart());
        }}
        roundness={0}
      />
    </>
  );
};

const theme = {
  background: "#14BDAC",
  line: "#0DA192",
  cross: "#545454",
  naught: "#F2EBD3",
};

export const TicTacToeBoard = ({
  board,
  onPress,
}: {
  board: IBoard;
  onPress: (position: IPosition) => void;
}) => {
  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 2, y1: 0, x2: 2, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
    { x1: 0, y1: 2, x2: 3, y2: 2 },
  ] as const;

  return (
    <Svg width="100%" style={{ aspectRatio: 1 }} viewBox="0 0 3 3">
      <Rect x={0} y={0} width={3} height={3} fill={theme.background} />
      {LINES.map((line, index) => (
        <Line key={index} {...line} stroke={theme.line} strokeWidth={0.1} />
      ))}

      {ALL_POSSIBLE_POSITIONS.map(([column, row]) => (
        <G key={`${column} ${row} ${board[column][row]}`}>
          <Rect
            x={Number(column)}
            y={Number(row)}
            width={1}
            height={1}
            fill="transparent"
            {...(Platform.OS === "web"
              ? {
                  onClick: () => {
                    onPress([column, row]);
                  },
                }
              : {
                  onPress: () => {
                    onPress([column, row]);
                  },
                })}
          />

          <Slot
            slot={board[column][row]}
            cx={Number(column) + 0.5}
            cy={Number(row) + 0.5}
            r={0.3}
          />
        </G>
      ))}
    </Svg>
  );
};

const Slot = ({
  slot,
  cx,
  cy,
  r,
}: {
  slot: ISlot;
  r: number;
  cx: number;
  cy: number;
}) => {
  return {
    Empty: () => <></>,
    X: () => <Cross r={r} cx={cx} cy={cy} />,
    O: () => <Naught r={r} cx={cx} cy={cy} />,
  }[slot]();
};

const Cross = ({ cx, cy, r }: { r: number; cx: number; cy: number }) => {
  return (
    <G strokeWidth={0.1} stroke={theme.cross}>
      {/* direction: \ */}
      <Line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
      {/* direction: / */}
      <Line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} />
    </G>
  );
};

const Naught = ({ cx, cy, r }: { r: number; cx: number; cy: number }) => {
  return (
    <Circle
      r={r}
      cx={cx}
      cy={cy}
      stroke={theme.naught}
      strokeWidth={0.1}
      fill="transparent"
    />
  );
};

export const TicTacToeIconSvg = () => {
  const positions: [IPosition, ISlot][] = [
    [["0", "0"], "X"],
    [["0", "1"], "Empty"],
    [["1", "0"], "Empty"],
    [["1", "1"], "O"],
  ];

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const;

  return (
    <Svg width="100%" style={{ aspectRatio: 1 }} viewBox="0 0 2 2">
      <Rect x={0} y={0} width={2} height={2} fill={theme.background} />
      {LINES.map((line, index) => (
        <Line key={index} {...line} stroke={theme.line} strokeWidth={0.1} />
      ))}

      {positions.map(([[column, row], slot]) => (
        <Slot
          key={`${column} ${row} ${slot}`}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </Svg>
  );
};
