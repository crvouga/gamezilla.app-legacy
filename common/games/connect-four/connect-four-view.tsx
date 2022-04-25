import { Platform } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Mask,
  Pattern,
  Rect,
  Stop,
} from "react-native-svg";
import {
  AppBar,
  AppBarAction,
  AppBarBackAction,
  Button,
  spacing,
} from "../../ui";
import { actions, IAction, IState } from "./connect-four";
import { COLUMN_COUNT, MAX_COLUMN_HEIGHT } from "./connect-four-columns";
import { theme } from "./connect-four-theme";

const makeSvgDefsIds = (namespace: string) => {
  return {
    holePattern: `${namespace}holepattern`,
    holeMask: `${namespace}holemask`,
    columnGradient: `${namespace}column`,
    playerOneGradient: `${namespace}playerone`,
    playerTwoGradient: `${namespace}playertwo`,
  };
};

type ISvgDefIds = ReturnType<typeof makeSvgDefsIds>;

const ConnectFourSvgDefs = ({
  scale,
  ids,
}: {
  scale: number;
  ids: ISvgDefIds;
}) => {
  return (
    <Defs>
      <Pattern
        id={ids.holePattern}
        patternUnits="userSpaceOnUse"
        width={1 * scale}
        height={1 * scale}
        viewBox={[0, 0, 1 * scale, 1 * scale].join(" ")}
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

      <LinearGradient id={ids.playerOneGradient} gradientTransform="rotate(90)">
        <Stop offset="0%" stopColor={theme.playerOne.light} />
        <Stop offset="100%" stopColor={theme.playerOne.dark} />
      </LinearGradient>

      <LinearGradient id={ids.playerTwoGradient} gradientTransform="rotate(90)">
        <Stop offset="0%" stopColor={theme.playerTwo.light} />
        <Stop offset="100%" stopColor={theme.playerTwo.dark} />
      </LinearGradient>
    </Defs>
  );
};

const Slot = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => {
  return (
    <Svg
      x={cx - r}
      y={cy - r}
      width={r * 2}
      height={r * 2}
      viewBox={[0, 0, 1, 1].join(", ")}
    >
      <Defs>
        <Mask id="slot" x="0" y="0" height="100%" width="100%">
          <Rect height="100%" width="100%" fill="#fff" />
          <Circle r={0.45} cx={0.5} cy={0.5} />
        </Mask>
      </Defs>
      <Rect
        x={0}
        y={0}
        width={1}
        height={1}
        mask={`url(#slot)`}
        fill={theme.primary.light}
      />
    </Svg>
  );
};

const allIndexes = [...new Array(COLUMN_COUNT)].flatMap((_, columnIndex) =>
  [...new Array(MAX_COLUMN_HEIGHT)].map((_, rowIndex) => ({
    columnIndex,
    rowIndex,
  }))
);

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

  const scale = 1;

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
        viewBox={[0, 0, COLUMN_COUNT * scale, MAX_COLUMN_HEIGHT * scale].join(
          " "
        )}
      >
        <G transform={`translate(0, ${MAX_COLUMN_HEIGHT * scale}) scale(1,-1)`}>
          <ConnectFourSvgDefs scale={scale} ids={ids} />

          <Rect
            x={0}
            y={0}
            width={COLUMN_COUNT * scale}
            height={MAX_COLUMN_HEIGHT * scale}
            fill={theme.primary.darker}
          />

          {state.columns.map((column, columnIndex) =>
            column.map((slot, rowIndex) => (
              <Circle
                key={[columnIndex, rowIndex, slot].join(" ")}
                cx={(columnIndex + 0.5) * scale}
                cy={(rowIndex + 0.5) * scale}
                r={0.5 * scale}
                fill={
                  slot === "PlayerOne"
                    ? `url(#${ids.playerOneGradient})`
                    : `url(#${ids.playerTwoGradient})`
                }
              />
            ))
          )}

          {allIndexes.map(({ columnIndex, rowIndex }) => (
            <Slot
              key={[columnIndex, rowIndex].join(" ")}
              cx={(columnIndex + 0.5) * scale}
              cy={(rowIndex + 0.5) * scale}
              r={0.5 * scale}
            />
          ))}

          <Rect
            x={0}
            y={0}
            width={COLUMN_COUNT * scale}
            height={MAX_COLUMN_HEIGHT * scale}
            mask={`url(#${ids.holeMask})`}
            fill={`url(#${ids.columnGradient})`}
          />

          {[...Array(COLUMN_COUNT)].map((_, columnIndex) => (
            <Rect
              key={columnIndex}
              x={columnIndex * scale}
              y={0}
              width={1 * scale}
              height={MAX_COLUMN_HEIGHT * scale}
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
        </G>
      </Svg>

      <Button
        onPress={() => {
          dispatch(actions.columnsCleared());
        }}
        roundness={0}
        labelStyle={{ padding: spacing(2), paddingVertical: spacing(1) }}
        title="Restart"
      />
    </>
  );
};
