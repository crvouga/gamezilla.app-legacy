import React from "react";
import Svg, { Line, Rect, SvgProps } from "react-native-svg";

const LINES = [
  { x1: 1, y1: 0, x2: 1, y2: 3 },
  { x1: 2, y1: 0, x2: 2, y2: 3 },
  { x1: 0, y1: 1, x2: 3, y2: 1 },
  { x1: 0, y1: 2, x2: 3, y2: 2 },
] as const;

const POSTIONS = [0, 1, 2].flatMap((x) => [0, 1, 2].map((y) => ({ x, y })));

export const TicTacToe = (props: SvgProps) => {
  console.log(LINES, POSTIONS);
  return (
    <Svg height="100%" width="100%" viewBox="0 0 3 3" {...props}>
      {LINES.map((line, index) => (
        <Line key={index} {...line} stroke="white" strokeWidth={0.1} />
      ))}
      {POSTIONS.map((position, index) => {
        <Rect key={index} {...position} width={1} height={1} fill="#123123" />;
      })}
    </Svg>
  );
};
