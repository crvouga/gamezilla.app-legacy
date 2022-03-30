import * as React from "react";
import Svg, { Circle, Rect, SvgProps } from "react-native-svg";

export const TicTacToeIcon = (props: SvgProps) => {
  return (
    <Svg height="100%" width="100%" viewBox="0 0 100 100" {...props}>
      <Circle
        cx="50"
        cy="50"
        r="45"
        stroke="blue"
        strokeWidth="2.5"
        fill="green"
      />
      <Rect
        x="15"
        y="15"
        width="70"
        height="70"
        stroke="red"
        strokeWidth="2"
        fill="yellow"
      />
    </Svg>
  );
};
