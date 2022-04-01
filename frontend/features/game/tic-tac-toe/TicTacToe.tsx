import React from "react";
import Svg, { Line, SvgProps } from "react-native-svg";

export const TicTacToe = (props: SvgProps) => {
  return (
    <Svg height="100%" width="100%" viewBox="0 0 3 3" {...props}>
      <Line x1={1} y1={0} x2={1} y2={3} stroke="white" strokeWidth={0.1} />
      <Line x1={2} y1={0} x2={2} y2={3} stroke="white" strokeWidth={0.1} />
      <Line x1={0} y1={1} x2={3} y2={1} stroke="white" strokeWidth={0.1} />
      <Line x1={0} y1={2} x2={3} y2={2} stroke="white" strokeWidth={0.1} />
    </Svg>
  );
};
