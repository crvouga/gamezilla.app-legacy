import { easeAttrs, rescale, Uuid } from '@gamezilla/shared/core';
import { SvgIcon, Sx } from '@gamezilla/shared/ui';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';
import {
  COLUMN_COUNT,
  ColumnIndex,
  Columns,
  isColumnIndex,
  MAX_COLUMN_HEIGHT,
  PlayerType,
  Position,
  toWins,
} from './connect-four';

export const gameTheme = {
  primary: {
    light: '#1976D2',
    dark: '#2195F2',
    darker: '#0D47A1',
  },
  PlayerOne: {
    light: '#f45e55',
    dark: '#c12521',
  },
  PlayerTwo: {
    light: '#FFB74D',
    dark: '#ff9a06',
  },
};

export const ViewPlayerOneGradientDef = ({
  gradientId,
  cx,
  cy,
  r,
}: {
  gradientId: string;
  cx: number;
  cy: number;
  r: number;
}) => {
  return (
    <radialGradient
      id={gradientId}
      gradientTransform="rotate(90)"
      cx={cx}
      cy={cy}
      r={r}
    >
      <stop offset="50%" stopColor={gameTheme.PlayerOne.light} />
      <stop offset="100%" stopColor={gameTheme.PlayerOne.dark} />
    </radialGradient>
  );
};

export const ViewPlayerTwoGradientDef = ({
  gradientId,
}: {
  gradientId: string;
}) => {
  return (
    <radialGradient id={gradientId} gradientTransform="rotate(90)">
      <stop offset="0%" stopColor={gameTheme.PlayerTwo.light} />
      <stop offset="100%" stopColor={gameTheme.PlayerTwo.dark} />
    </radialGradient>
  );
};

type ViewColumnsProps = {
  columns: Columns;
  ghost?: { columnIndex: ColumnIndex; playerType: PlayerType };
  onClick?: (columnIndex: ColumnIndex) => void;
  onHover?: (columnINdex: ColumnIndex) => void;
  disabled?: boolean;
};

export const ViewColumns = ({
  implementation = 'svg',
  ...props
}: ViewColumnsProps & {
  implementation?: 'svg' | 'canvas';
}) => {
  switch (implementation) {
    case 'canvas': {
      return <ViewColumnsCanvas {...props} />;
    }

    case 'svg': {
      return <ViewColumnsSvg {...props} />;
    }
  }
};

type SvgIds = {
  playerOneGradient: string;
  playerTwoGradient: string;
  holePattern: string;
  columnGradient: string;
  holeMask: string;
};

const ViewColumnsSvg = ({
  columns,
  onClick,
  onHover,
  disabled,
}: ViewColumnsProps) => {
  const ref = useRef(Uuid.generateSync());
  const ids = {
    playerOneGradient: `playerOneGradient${ref.current}`,
    playerTwoGradient: `playerTwoGradient${ref.current}`,
    holePattern: `holePattern${ref.current}`,
    columnGradient: `columnGradient${ref.current}`,
    holeMask: `holeMask${ref.current}`,
  };

  const playerOneFill = `url(#${ids.playerOneGradient})`;
  const playerTwoFill = `url(#${ids.playerTwoGradient})`;

  return (
    <svg width="100%" viewBox={`0 0 ${COLUMN_COUNT} ${MAX_COLUMN_HEIGHT}`}>
      <SvgDefs ids={ids} />

      <g transform={`translate(0, ${MAX_COLUMN_HEIGHT}) scale(1,-1)`}>
        <rect
          x={0}
          y={0}
          width={COLUMN_COUNT}
          height={MAX_COLUMN_HEIGHT}
          fill={gameTheme.primary.darker}
        />

        <TransitionGroup component={'g'} transform="translate(0.5, 0.5)">
          {columns.flatMap((column, x) =>
            column.map((disc, y) => (
              <Transition
                component="g"
                key={`${x} ${y} ${disc}`}
                addEndListener={() => {
                  //
                }}
                onEnter={onEnter({ y })}
                onExit={onExit({ x, y })}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={0.5}
                  fill={disc === 'PlayerOne' ? playerOneFill : playerTwoFill}
                />
              </Transition>
            ))
          )}
        </TransitionGroup>

        <rect
          x={0}
          y={0}
          width={COLUMN_COUNT}
          height={MAX_COLUMN_HEIGHT}
          fill={`url(#${ids.columnGradient})`}
          mask={`url(#${ids.holeMask})`}
        />

        <ViewWins columns={columns} />

        {[...new Array(COLUMN_COUNT)].map((_, columnIndex) => (
          <rect
            style={{
              cursor:
                disabled || !onClick
                  ? undefined
                  : (columns[columnIndex]?.length ?? 0) >= MAX_COLUMN_HEIGHT
                  ? 'not-allowed'
                  : 'pointer',
            }}
            onMouseOver={() => {
              if (!disabled && isColumnIndex(columnIndex) && onHover) {
                onHover(columnIndex);
              }
            }}
            onClick={() => {
              if (!disabled && isColumnIndex(columnIndex) && onClick) {
                onClick(columnIndex);
              }
            }}
            key={columnIndex}
            x={columnIndex}
            y={0}
            width={1}
            height={MAX_COLUMN_HEIGHT}
            fill="transparent"
          />
        ))}
      </g>
    </svg>
  );
};

/* Have to increase the viewBox so that the draw animation is smooth >:-{ */
const n = 1000;

const distance = (a: Position, b: Position): number =>
  ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5;

const angleBetween = (a: Position, b: Position): number =>
  (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

const ViewWins = ({ columns }: { columns: Columns }) => {
  const wins = useMemo(() => toWins(columns), [columns]);

  return (
    <svg
      x={0}
      y={0}
      width={COLUMN_COUNT}
      height={MAX_COLUMN_HEIGHT}
      viewBox={`0 0 ${COLUMN_COUNT * n} ${MAX_COLUMN_HEIGHT * n}`}
    >
      <TransitionGroup component="g">
        {wins.flatMap((win, i) => {
          const westMost = win[0];
          const eastMost = win[win.length - 1];
          if (!eastMost) {
            return [];
          }

          const theta = angleBetween(westMost, eastMost);
          const originX = (westMost.x + 0.5) * n;
          const originY = (westMost.y + 0.5) * n;
          const width = (distance(westMost, eastMost) + 1) * n;
          return [
            <Transition
              key={i}
              addEndListener={() => {
                //
              }}
              onEnter={draw}
              onExit={undraw}
            >
              <rect
                transform={`rotate(${theta} ${originX} ${originY})`}
                x={westMost.x * n}
                y={westMost.y * n}
                width={width}
                height={n}
                rx={n / 2}
                stroke="white"
                fill="transparent"
                strokeWidth={n / 8}
                className="pointer-events-none"
              />
            </Transition>,
          ];
        })}
      </TransitionGroup>
    </svg>
  );
};

const draw = (node: HTMLElement) => {
  if (!(node instanceof SVGRectElement)) {
    return;
  }

  const length = node.getTotalLength();
  easeAttrs(node, {
    'stroke-dasharray': {
      from: length,
      to: length,
      duration: 500,
    },
    'stroke-dashoffset': {
      from: length,
      to: 0,
      duration: 500,
    },
  });
};

const undraw = (node: HTMLElement) => {
  if (!(node instanceof SVGRectElement)) {
    return;
  }

  const length = node.getTotalLength();
  easeAttrs(node, {
    'stroke-dasharray': {
      from: length,
      to: length,
      duration: 500,
    },
    'stroke-dashoffset': {
      from: 0,
      to: length,
      duration: 500,
    },
  });
};

const onEnter =
  ({ y }: { y: number }) =>
  (node: HTMLElement) => {
    easeAttrs(node, {
      cy: {
        from: MAX_COLUMN_HEIGHT + 1,
        to: y,
        duration: 200 + 300 * (1 - y / MAX_COLUMN_HEIGHT),
        easing: { type: 'ease-out-bounce' },
      },
    });
  };

const onExit =
  ({ x, y }: { x: number; y: number }) =>
  (node: HTMLElement) => {
    easeAttrs(node, {
      cy: {
        from: y,
        to: y - MAX_COLUMN_HEIGHT,
        duration: 750,
        easing: { type: 'ease-in-back' },
        delay: (x / COLUMN_COUNT) * 500,
      },
    });
  };

const SvgDefs = ({ ids }: { ids: SvgIds }) => {
  return (
    <defs>
      <pattern
        id={ids.holePattern}
        patternUnits="userSpaceOnUse"
        width={1}
        height={1}
      >
        <circle cx={0.5} cy={0.5} r={0.425} fill="black"></circle>
      </pattern>

      <mask id={ids.holeMask}>
        <rect
          x={0}
          y={0}
          width={COLUMN_COUNT}
          height={MAX_COLUMN_HEIGHT}
          fill="white"
        ></rect>
        <rect
          x={0}
          y={0}
          width={COLUMN_COUNT}
          height={MAX_COLUMN_HEIGHT}
          fill={`url(#${ids.holePattern})`}
        ></rect>
      </mask>

      <linearGradient id={ids.columnGradient} gradientTransform="rotate(90)">
        <stop offset="0%" stopColor={gameTheme.primary.light} />
        <stop offset="100%" stopColor={gameTheme.primary.dark} />
      </linearGradient>

      <linearGradient id={ids.playerOneGradient} gradientTransform="rotate(90)">
        <stop offset="0%" stopColor={gameTheme.PlayerOne.light} />
        <stop offset="100%" stopColor={gameTheme.PlayerOne.dark} />
      </linearGradient>

      <linearGradient id={ids.playerTwoGradient} gradientTransform="rotate(90)">
        <stop offset="0%" stopColor={gameTheme.PlayerTwo.light} />
        <stop offset="100%" stopColor={gameTheme.PlayerTwo.dark} />
      </linearGradient>
    </defs>
  );
};

function isCanvas(i: unknown): i is HTMLCanvasElement {
  return i instanceof HTMLCanvasElement;
}

const ViewColumnsCanvas = ({ columns, onClick }: ViewColumnsProps) => {
  useLayoutEffect(() => {
    const canvas = document.getElementById('view-columns-canvas');

    if (!canvas) {
      return;
    }

    if (!isCanvas(canvas)) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.canvas.height =
      (MAX_COLUMN_HEIGHT / COLUMN_COUNT) * context.canvas.width;

    paint({ context, columns });
  });

  return (
    <canvas
      id="view-columns-canvas"
      style={{ width: '100%', cursor: 'pointer' }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const elementRelativeX = event.clientX - rect.left;
        const elementWidth = event.currentTarget.width;
        const canvasRelativeX = (elementRelativeX * elementWidth) / rect.width;
        const columnIndex = Math.floor(
          rescale({
            value: canvasRelativeX,
            from: [0, elementWidth],
            to: [0, COLUMN_COUNT],
          })
        );

        if (onClick && isColumnIndex(columnIndex)) {
          onClick(columnIndex);
          return;
        }
      }}
    />
  );
};

const paint = ({
  context,
  columns,
}: {
  context: CanvasRenderingContext2D;
  columns: Columns;
}): void => {
  const width = context.canvas.width;
  const height = context.canvas.height;

  // put origin on bottom left
  context.translate(0, height);
  context.scale(1, -1);

  context.fillStyle = gameTheme.primary.darker;
  context.fillRect(0, 0, width, height);

  const cellWidth = width / COLUMN_COUNT;
  const cellHeight = height / MAX_COLUMN_HEIGHT;

  let x, y, cx, cy, r, gradient;

  for (x = 0; x < columns.length; x++) {
    const column = columns[x];
    if (!column) {
      continue;
    }
    for (y = 0; y < column.length; y++) {
      const disc = column[y];

      if (!disc) {
        continue;
      }

      cx = (x + 1 / 2) * cellWidth;
      cy = (y + 1 / 2) * cellHeight;
      r = cellWidth / 2;

      context.beginPath();
      context.arc(cx, cy, r, 0, Math.PI * 2);
      try {
        gradient = context.createRadialGradient(cx, cy, 0, cx, cy, r * 0.74);
        gradient.addColorStop(0, gameTheme[disc].light);
        gradient.addColorStop(1, gameTheme[disc].dark);
        context.fillStyle = gradient;
      } catch (error) {
        context.fillStyle = gameTheme[disc].light;
      }
      context.fill();
      context.closePath();
    }
  }

  // this is a hack that prevents a bug when creating the holes in board using the evenodd fill method
  context.beginPath();
  context.arc(
    width + cellWidth,
    height + cellHeight,
    cellWidth / 2,
    0,
    Math.PI * 2
  );
  context.fillStyle = 'purple';
  context.fill();
  context.closePath();

  //
  //
  //
  //

  for (x = 0; x < COLUMN_COUNT; x++) {
    for (y = 0; y < MAX_COLUMN_HEIGHT; y++) {
      cx = (x + 1 / 2) * cellWidth;
      cy = (y + 1 / 2) * cellHeight;
      r = (cellWidth / 2) * 0.8;
      context.moveTo(cy, cy);
      context.arc(cx, cy, r, 0, Math.PI * 2);
    }
  }

  context.fillStyle = gameTheme.primary.light;
  context.rect(0, 0, width, height);
  context.fill('evenodd');
};

export const ViewCoverArt = () => {
  const ref = useRef(Uuid.generateSync());
  const ids = {
    playerOneGradient: `playerOneGradient${ref.current}`,
    playerTwoGradient: `playerTwoGradient${ref.current}`,
    holePattern: `holePattern${ref.current}`,
    columnGradient: `columnGradient${ref.current}`,
    holeMask: `holeMask${ref.current}`,
  };

  const playerOneFill = `url(#${ids.playerOneGradient})`;
  const playerTwoFill = `url(#${ids.playerTwoGradient})`;

  return (
    <svg width="100%" viewBox={'0 0 2 2'}>
      <defs>
        <pattern
          id={ids.holePattern}
          patternUnits="userSpaceOnUse"
          width={1}
          height={1}
        >
          <circle cx={0.5} cy={0.5} r={0.425} fill="black"></circle>
        </pattern>

        <mask id={ids.holeMask}>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill="white"
          ></rect>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill={`url(#${ids.holePattern})`}
          ></rect>
        </mask>

        <linearGradient id={ids.columnGradient} gradientTransform="rotate(90)">
          <stop offset="0%" stopColor={gameTheme.primary.light} />
          <stop offset="100%" stopColor={gameTheme.primary.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={gameTheme.PlayerOne.light} />
          <stop offset="100%" stopColor={gameTheme.PlayerOne.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={gameTheme.PlayerTwo.light} />
          <stop offset="100%" stopColor={gameTheme.PlayerTwo.dark} />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={2} height={2} fill={gameTheme.primary.darker} />

      <circle cx={0.5} cy={0} r={0.5} fill={playerOneFill} />

      <circle cx={1.5} cy={0.5} r={0.5} fill={playerTwoFill} />

      <circle cx={1.5} cy={1.5} r={0.5} fill={playerOneFill} />

      <circle cx={0.5} cy={1.5} r={0.5} fill={playerTwoFill} />

      <rect
        x={0}
        y={0}
        width={COLUMN_COUNT}
        height={MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holeMask})`}
      />
    </svg>
  );
};

export const PlayerIcon = ({
  playerType,
  sx,
}: {
  playerType: PlayerType;
  sx?: Sx;
}) => {
  switch (playerType) {
    case 'PlayerOne': {
      return <PlayerOneIcon sx={sx} />;
    }

    case 'PlayerTwo': {
      return <PlayerTwoIcon sx={sx} />;
    }
  }
};

export const PlayerOneIcon = ({ key, sx }: { key?: string; sx?: Sx }) => {
  const ref = useRef(Uuid.generateSync());
  return (
    <SvgIcon key={key} viewBox="-1 -1 2 2" sx={{ ...sx }}>
      <ViewPlayerOneGradientDef cx={0} cy={0} r={1} gradientId={ref.current} />
      <circle cx={0} cy={0} r={1} fill={`url(#${ref.current})`} />
    </SvgIcon>
  );
};

export const PlayerTwoIcon = ({ key, sx }: { key?: string; sx?: Sx }) => {
  const ref = useRef(Uuid.generateSync());
  return (
    <SvgIcon key={key} viewBox="-1 -1 2 2" sx={{ ...sx }}>
      <ViewPlayerTwoGradientDef gradientId={ref.current} />
      <circle cx={0} cy={0} r={1} fill={`url(#${ref.current})`} />
    </SvgIcon>
  );
};
