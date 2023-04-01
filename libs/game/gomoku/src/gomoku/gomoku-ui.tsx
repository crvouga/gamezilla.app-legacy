import { Posix, Ease, Hex } from '@gamezilla/core';
import { SvgIcon, Sx } from '@gamezilla/shared/ui';
import { allPositions, Board, Bounds, bounds, Stone } from './gomoku';
import { Position } from './gomoku-position';

//
//
// Model
//
//

export type VisualModel = {
  [x: string]: {
    [y: string]: VisualStone;
  };
};

export const initVisual = ({
  board,
  now,
  skipAnimation,
}: {
  now: Posix;
  board: Board;
  skipAnimation?: boolean;
}): VisualModel => {
  let model: VisualModel = {};
  for (const x in board) {
    const slice = board[x];
    if (!slice) {
      continue;
    }
    for (const y in slice) {
      const stone = slice[y];
      if (!stone) {
        continue;
      }

      const position = { x: parseInt(x), y: parseInt(y) };

      model = setStone(model, position, {
        type: 'enter',
        radius: skipAnimation
          ? Ease.initConstant(now, 0.45)
          : Ease.init({
              startMs: now,
              from: 0,
              to: 0.45,
              durationMs: 100,
              delayMs: 20 * position.x + 20 * position.y + 100,
              easing: { type: 'ease-out-quint' },
            }),
        stone: stone,
      });
    }
  }

  return model;
};

export type VisualStone = {
  type: 'enter' | 'exit';
  radius: Ease.Model;
  stone: Stone;
};

const setStone = (
  model: VisualModel,
  { x, y }: { x: number; y: number },
  stone: VisualStone
): VisualModel => {
  return {
    ...model,
    [x]: {
      ...(model[x] || {}),
      [y]: stone,
    },
  };
};

const toStone = (
  model: VisualModel,
  { x, y }: { x: number; y: number }
): VisualStone | null => {
  return model[x]?.[y] ?? null;
};

//
//
//

const backgroundColor = '#C88655';
const lineColor = Hex.darken(backgroundColor, 0.3);
const gameTheme = {
  whiteStone: 'white',
  blackStone: 'black',
  background: backgroundColor,
  line: lineColor,
};

export const stoneToColor = (stone: Stone): string => {
  switch (stone) {
    case 'black':
      return gameTheme.blackStone;

    case 'white':
      return gameTheme.whiteStone;
  }
};

export const viewStoneIcon = ({ stone, ...sx }: { stone: Stone } & Sx) => {
  return (
    <SvgIcon viewBox="-1 -1 2 2" sx={{ ...sx }}>
      <circle
        cx={0}
        cy={0}
        r={0.9}
        fill={stoneToColor(stone)}
        strokeWidth={0.1}
        stroke="#454545"
      />
    </SvgIcon>
  );
};

const coverArtVisual = initVisual({
  board: {
    2: { 2: 'black', 3: 'white' },
    3: { 2: 'black', 3: 'white' },
    4: { 2: 'white', 3: 'black' },
  },
  now: Posix.fromNumber(0),
  skipAnimation: true,
});

export const viewCoverArt = () => {
  return viewBoard({
    viewBoxOffset: 0.5,
    bounds: {
      lower: { x: 0, y: 0 },
      upper: { x: 6, y: 6 },
    },
    model: coverArtVisual,
  });
};

export const viewBoard = ({
  model,
  onPress,
  bounds: bounds_ = bounds,
  viewBoxOffset = 0.8,
}: {
  model: VisualModel;
  onPress?: (position: Position) => void;
  bounds?: Bounds;
  viewBoxOffset?: number;
}) => {
  const boundsView = {
    lower: {
      x: bounds_.lower.x - viewBoxOffset,
      y: bounds_.lower.y - viewBoxOffset,
    },
    upper: {
      x: bounds_.upper.x - 1 + viewBoxOffset,
      y: bounds_.upper.y - 1 + viewBoxOffset,
    },
  };

  const width = boundsView.upper.x - boundsView.lower.x;
  const height = boundsView.upper.y - boundsView.lower.y;

  const viewBox = [boundsView.lower.x, boundsView.lower.y, width, height].join(
    ' '
  );

  return (
    <svg style={{ overflow: 'hidden' }} width="100%" viewBox={viewBox}>
      <g strokeWidth={0.05}>
        <rect
          x={boundsView.lower.x}
          y={boundsView.lower.y}
          width={width}
          height={height}
          fill={gameTheme.background}
        />

        <g stroke={gameTheme.line}>
          <rect
            x={bounds_.lower.x}
            y={bounds_.lower.y}
            width={bounds_.upper.x - 1 - bounds_.lower.x}
            height={bounds_.upper.y - 1 - bounds_.lower.y}
            fill={gameTheme.background}
          />
          {rangeInclusive({ lower: 1, upper: bounds_.upper.y - 1 }).map((x) => (
            <line
              key={`x${x}`}
              x1={x}
              y1={bounds_.lower.y}
              x2={x}
              y2={bounds_.upper.y - 1}
            />
          ))}

          {rangeInclusive({ lower: 1, upper: bounds.upper.x - 1 }).map((y) => (
            <line
              key={`y${y}`}
              x1={bounds_.lower.x}
              y1={y}
              x2={bounds_.upper.x - 1}
              y2={y}
            />
          ))}
        </g>

        <g>
          {allPositions.map(({ x, y }) => {
            const stone = toStone(model, { x, y });
            if (!stone) {
              return (
                <circle
                  key={[x, y].join('-')}
                  onMouseDown={
                    onPress
                      ? () => {
                          onPress({ x, y });
                        }
                      : undefined
                  }
                  cx={x}
                  cy={y}
                  r={1 / 2}
                  fill="transparent"
                  stroke="none"
                  style={
                    onPress ? { cursor: 'pointer' } : { cursor: 'default' }
                  }
                />
              );
            }

            return (
              <circle
                key={[x, y, stone.stone].join('-')}
                cx={x}
                cy={y}
                r={stone.radius.value}
                fill={stoneToColor(stone.stone)}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
};

const rangeInclusive = ({
  lower,
  upper,
}: {
  lower: number;
  upper: number;
}): number[] => {
  const range: number[] = [];
  for (let n = lower; n <= upper; n++) {
    range.push(n);
  }
  return range;
};

export const step = ({
  now,
  board,
  model,
}: {
  now: Posix;
  board: Board;
  model: VisualModel;
}): VisualModel => {
  let modelNew: VisualModel = {};

  for (let x = bounds.lower.x; x < bounds.upper.x; x++) {
    for (let y = bounds.lower.y; y < bounds.upper.y; y++) {
      const stoneTrue = board[x]?.[y];
      const stoneVisual = model[x]?.[y];

      //
      // Enter
      //
      if (stoneTrue && !stoneVisual) {
        modelNew = setStone(
          modelNew,
          { x, y },
          {
            type: 'enter',
            stone: stoneTrue,
            radius: Ease.init({
              startMs: now,
              durationMs: 1000 / 4,
              from: 0,
              to: 0.45,
              easing: { type: 'ease-out-back' },
            }),
          }
        );
        continue;
      }

      //
      // Exit
      //
      if (!stoneTrue && stoneVisual && stoneVisual.type === 'enter') {
        modelNew = setStone(
          modelNew,
          { x, y },
          {
            type: 'exit',
            stone: stoneVisual.stone,
            radius: Ease.init({
              startMs: now,
              durationMs: 1000 / 4,
              delayMs: x * 20 + y * 20,
              from: 0.45,
              to: 0,
              easing: { type: 'ease-in-back' },
            }),
          }
        );
        continue;
      }

      //
      // Remove
      //
      if (
        stoneVisual &&
        !Ease.isAnimating(now, stoneVisual.radius) &&
        stoneVisual.type === 'exit'
      ) {
        continue;
      }

      //
      // Step
      //
      if (stoneVisual) {
        modelNew = setStone(
          modelNew,
          { x, y },
          {
            ...stoneVisual,
            radius: Ease.step(now, stoneVisual.radius),
          }
        );
        continue;
      }
    }
  }

  return modelNew;
};

export const isAnimating = ({
  now,
  model,
}: {
  now: Posix;
  model: VisualModel;
}): boolean => {
  for (const xKey in model) {
    for (const yKey in model?.[xKey] ?? {}) {
      const stone = model[xKey]?.[yKey];
      if (stone && Ease.isAnimating(now, stone.radius)) {
        return true;
      }
    }
  }
  return false;
};
