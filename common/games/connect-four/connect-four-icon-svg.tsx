import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Mask,
  Pattern,
  Rect,
  Stop,
} from "react-native-svg";
import { COLUMN_COUNT, MAX_COLUMN_HEIGHT } from "./connect-four-columns";
import { theme } from "./connect-four-theme";

export const ConnectFourSvgIcon = () => {
  const ids = {
    playerOneGradient: "playerOneGradient",
    playerTwoGradient: "playerTwoGradient",
    holePattern: "holePattern",
    columnGradient: "columnGradient",
    holeMask: "holeMask",
  };

  const playerOneFill = `url(#${ids.playerOneGradient})`;
  const playerTwoFill = `url(#${ids.playerTwoGradient})`;

  const scale = 100;

  return (
    <Svg width="100%" style={{ aspectRatio: 1 }} viewBox={"0 0 2 2"}>
      <Defs>
        <Pattern
          id={ids.holePattern}
          patternUnits="userSpaceOnUse"
          width={1 * scale}
          height={1 * scale}
        >
          <Circle
            cx={0.5 * scale}
            cy={0.5 * scale}
            r={0.425 * scale}
            fill="black"
          ></Circle>
        </Pattern>

        <Mask id={ids.holeMask}>
          <Rect
            x={0}
            y={0}
            width={COLUMN_COUNT * scale}
            height={MAX_COLUMN_HEIGHT * scale}
            fill="white"
          ></Rect>
          <Rect
            x={0}
            y={0}
            width={COLUMN_COUNT * scale}
            height={MAX_COLUMN_HEIGHT * scale}
            fill={`url(#${ids.holePattern})`}
          ></Rect>
        </Mask>

        <LinearGradient id={ids.columnGradient} gradientTransform="rotate(90)">
          <Stop offset="0%" stopColor={theme.primary.light} />
          <Stop offset="100%" stopColor={theme.primary.dark} />
        </LinearGradient>

        <LinearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)"
        >
          <Stop offset="0%" stopColor={theme.playerOne.light} />
          <Stop offset="100%" stopColor={theme.playerOne.dark} />
        </LinearGradient>

        <LinearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)"
        >
          <Stop offset="0%" stopColor={theme.playerTwo.light} />
          <Stop offset="100%" stopColor={theme.playerTwo.dark} />
        </LinearGradient>
      </Defs>

      <Rect x={0} y={0} width={2} height={2} fill={theme.primary.darker} />

      <Circle cx={0.5} cy={0} r={0.5} fill={playerOneFill} />

      <Circle cx={1.5} cy={0.5} r={0.5} fill={playerTwoFill} />

      <Circle cx={1.5} cy={1.5} r={0.5} fill={playerOneFill} />

      <Circle cx={0.5} cy={1.5} r={0.5} fill={playerTwoFill} />

      <Rect
        x={0}
        y={0}
        width={COLUMN_COUNT}
        height={MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holeMask})`}
      />
    </Svg>
  );
};
