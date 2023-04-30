import { Ease, Easing, Hex } from '@gamezilla/core';
import { SvgIcon, Sx } from '@gamezilla/shared/ui';
import { Transition, TransitionGroup } from 'react-transition-group';
import {
  Board,
  Bounds,
  Stone,
  allPositions,
  bounds,
  presetToStars,
} from './gomoku';
import { Position } from './gomoku-position';

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

export const ViewCoverArt = () => {
  return ViewBoard({
    viewBoxOffset: 0.5,
    bounds: {
      lower: { x: 0, y: 0 },
      upper: { x: 6, y: 6 },
    },
    board: {
      2: { 2: 'black', 3: 'white' },
      3: { 2: 'black', 3: 'white' },
      4: { 2: 'white', 3: 'black' },
    },
  });
};

export const ViewBoard = ({
  onPress,
  board,
  bounds: bounds_ = bounds,
  viewBoxOffset = 0.8,
}: {
  board: Board;
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

  const stars = presetToStars['9x9'].map((pos) => pos);

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
          {range({ lower: 1, upper: bounds_.upper.y }).map((x) => (
            <line
              key={`x${x}`}
              x1={x}
              y1={bounds_.lower.y}
              x2={x}
              y2={bounds_.upper.y - 1}
            />
          ))}

          {range({ lower: 1, upper: bounds.upper.x }).map((y) => (
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
          {stars.map((pos) => {
            return (
              <circle
                key={[pos.x, pos.y].join(', ')}
                cx={pos.x}
                cy={pos.y}
                r={0.12}
                fill={gameTheme.line}
              />
            );
          })}
        </g>

        <TransitionGroup component={'g'}>
          {allPositions.flatMap(({ x, y }) => {
            const stone = board[x]?.[y] ?? null;
            if (!stone) {
              return [];
            }

            return [
              <Transition
                component="g"
                key={[x, y, stone].join(', ')}
                timeout={1000}
                onEnter={(node: HTMLElement) =>
                  easeHtmlAttrs(node, {
                    r: {
                      min: 0,
                      from: 0,
                      to: 0.45,
                      duration: 200,
                      easing: { type: 'ease-out-back' },
                    },
                  })
                }
                onExit={(node: HTMLElement) =>
                  easeHtmlAttrs(node, {
                    r: {
                      from: 0.45,
                      to: 0,
                      duration: 200,
                      easing: { type: 'ease-in-expo' },
                    },
                  })
                }
              >
                <circle
                  key={[x, y, stone].join('-')}
                  cx={x}
                  cy={y}
                  r={0.45}
                  fill={stoneToColor(stone)}
                />
              </Transition>,
            ];
          })}
        </TransitionGroup>

        <g>
          {allPositions.map(({ x, y }) => (
            <circle
              key={[x, y].join(', ')}
              cx={x}
              cy={y}
              r={0.5}
              fill="transparent"
              onClick={() => onPress?.({ x, y })}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </g>
      </g>
    </svg>
  );
};

const easeHtmlAttrs = (
  node: HTMLElement,
  attributes: {
    [attribute: string]: {
      min?: number;
      max?: number;
      from: number;
      to: number;
      duration: number;
      easing: Easing;
    };
  }
) => {
  const startTime = performance.now();
  const step = (currentTime: number) => {
    let loop = false;
    for (const attribute in attributes) {
      const config = attributes[attribute];

      if (!config) {
        continue;
      }

      const {
        from,
        to,
        min = -Infinity,
        max = Infinity,
        duration,
        easing,
      } = config;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = from + (to - from) * Ease.ease(easing, progress);
      const clamped = Math.min(max, Math.max(min, eased));

      node.setAttribute(attribute, String(clamped));

      if (progress < 1) {
        loop = true;
      }
    }

    if (loop) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
};

const range = ({
  lower,
  upper,
}: {
  lower: number;
  upper: number;
}): number[] => {
  const range: number[] = [];
  for (let n = lower; n < upper; n++) {
    range.push(n);
  }
  return range;
};
