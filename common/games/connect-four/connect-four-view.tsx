import { Platform } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Mask,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { AppBar, AppBarAction, AppBarBackAction } from "../../ui";
import {
  ISlot,
  actions,
  IAction,
  IState,
  COLUMN_COUNT,
  MAX_COLUMN_HEIGHT,
} from "./connect-four";

const theme = {
  primary: {
    light: "#2195F2",
    dark: "#1976D2",
    darker: "#0D47A1",
  },
  playerOne: {
    light: "#FFB74D",
    dark: "#FFA623",
  },
  playerTwo: {
    light: "#F24237",
    dark: "#DB332F",
  },
};

const makeSvgDefsIds = (namespace: string) => {
  return {
    cellPattern: `${namespace}-cell-pattern`,
    holeMask: `${namespace}-hole-mask`,
    column: `${namespace}-column`,
    playerOne: `${namespace}-player-one`,
    playerTwo: `${namespace}-player-two`,
  };
};

type ISvgDefIds = ReturnType<typeof makeSvgDefsIds>;

const ConnectFourSvgDefinitions = ({ ids }: { ids: ISvgDefIds }) => {
  return (
    <Defs>
      <Pattern
        id={ids.cellPattern}
        patternUnits="userSpaceOnUse"
        width="1"
        height="1"
      >
        <Circle cx="0.5" cy="0.5" r="0.45" fill="black"></Circle>
      </Pattern>

      <Mask id={ids.holeMask}>
        <Rect width="10" height="60" fill="white"></Rect>
        <Rect width="10" height="60" fill={`url(#${ids.cellPattern})`}></Rect>
      </Mask>

      <LinearGradient id={ids.column} gradientTransform="rotate(90)">
        <Stop offset="0%" stopColor={theme.primary.light} />
        <Stop offset="100%" stopColor={theme.primary.dark} />
      </LinearGradient>

      <RadialGradient id={ids.playerOne} gradientTransform="rotate(90)">
        <Stop offset="0%" stopColor={theme.playerOne.light} />
        <Stop offset="100%" stopColor={theme.playerOne.dark} />
      </RadialGradient>

      <RadialGradient id={ids.playerTwo} gradientTransform="rotate(90)">
        <Stop offset="0%" stopColor={theme.playerTwo.light} />
        <Stop offset="100%" stopColor={theme.playerTwo.dark} />
      </RadialGradient>
    </Defs>
  );
};

const Slot = ({
  slot,
  cx,
  cy,
  r,
}: {
  slot: ISlot;
  cx: number;
  cy: number;
  r: number;
}) => {
  if (slot === "Empty") {
    return null;
  }

  if (slot === "PlayerOne") {
    return <Circle cx={cx} cy={cy} r={r} fill={"url(#playerOne)"} />;
  }

  return <Circle cx={cx} cy={cy} r={r} fill={"url(#playerTwo)"} />;
};

export const ConnectFourView = ({
  onStop,
  onBack,
  state,
  dispatch,
}: {
  onStop: () => void;
  onBack: () => void;
  dispatch: (action: IAction) => void;
  state: IState;
}) => {
  const onColumnPressed = (columnIndex: number) => {
    dispatch(actions.columnPressed(columnIndex));
  };

  const ids = makeSvgDefsIds("game");

  return (
    <>
      <AppBar
        left={<AppBarBackAction onPress={onBack} />}
        title="Connect Four"
        right={<AppBarAction onPress={onStop} icon="power" />}
      />

      <Svg
        width="100%"
        style={{ aspectRatio: COLUMN_COUNT / MAX_COLUMN_HEIGHT }}
        viewBox={[0, 0, COLUMN_COUNT, MAX_COLUMN_HEIGHT].join(" ")}
      >
        <ConnectFourSvgDefinitions ids={ids} />

        <Rect
          x={0}
          y={0}
          width={COLUMN_COUNT}
          height={MAX_COLUMN_HEIGHT}
          fill={theme.primary.darker}
        />

        {state.columns.map((column, columnIndex) =>
          column.map((slot, rowIndex) =>
            slot === "Empty" ? null : (
              <Circle
                cx={columnIndex + 0.5}
                cy={rowIndex + 0.5}
                r={0.5}
                fill={
                  slot === "PlayerOne"
                    ? `url(#${ids.playerOne})`
                    : `url(#${ids.playerTwo})`
                }
              />
            )
          )
        )}

        <Rect
          x={0}
          y={0}
          width={COLUMN_COUNT}
          height={MAX_COLUMN_HEIGHT}
          mask={`url(#${ids.holeMask})`}
          fill={`url(#${ids.column})`}
        />

        {[...Array(COLUMN_COUNT)].map((_, columnIndex) => (
          <Rect
            key={columnIndex}
            x={columnIndex}
            y={0}
            width={1}
            height={MAX_COLUMN_HEIGHT}
            fill="transparent"
            {...(Platform.OS === "web"
              ? {
                  onClick: () => {
                    onColumnPressed(columnIndex);
                  },
                }
              : {
                  onPress: () => {
                    onColumnPressed(columnIndex);
                  },
                })}
          />
        ))}
      </Svg>
    </>
  );
};

export const ConnectFourSvgIcon = () => {
  const ids = makeSvgDefsIds("icon");

  const playerOneFill = `url(#${ids.playerOne})`;
  const playerTwoFill = `url(#${ids.playerTwo})`;

  return (
    <Svg width="100%" style={{ aspectRatio: 1 }} viewBox={"0 0 2 2"}>
      <ConnectFourSvgDefinitions ids={ids} />

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
        mask={`url(#${ids.holeMask})`}
        fill={`url(#${ids.column})`}
      />
    </Svg>
  );
};
