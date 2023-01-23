import { Ease, rescale, Uuid } from '@gamezilla/core';
import { SvgIcon, Sx } from '@gamezilla/shared/ui';
import { useLayoutEffect, useRef } from 'react';
import {
  ColumnIndex,
  Columns,
  COLUMN_COUNT,
  isColumnIndex,
  MAX_COLUMN_HEIGHT,
  PlayerType,
} from './connect-four';

//
//
//
// Model
//
//
//

export type VisualModel = Disc[][];

export type Disc = {
  type: 'entry' | 'exit';
  yPosition_: Ease.Model;
  playerType: PlayerType;
};

//
//
//
//
//
//

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
  visual: VisualModel;
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

const ViewColumnsSvg = ({
  columns,
  onClick,
  onHover,
  // ghost,
  disabled,
  visual,
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
    <svg width="100%" viewBox={'0 0 7 6'}>
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

      <rect x={0} y={0} width={7} height={6} fill={gameTheme.primary.darker} />

      {/* {columns.map((column, columnIndex) =>
        column.map((player, rowIndex) => (
          <circle
            key={[columnIndex, rowIndex].join(", ")}
            cx={columnIndex + 0.5}
            cy={MAX_COLUMN_HEIGHT - (rowIndex + 0.5)}
            r={0.5}
            fill={player === "PlayerOne" ? playerOneFill : playerTwoFill}
          />
        )),
      )} */}

      {visual.map((columnVisual, columnIndex) =>
        columnVisual.map((disc, rowIndex) => (
          <circle
            key={[columnIndex, rowIndex].join(', ')}
            cx={columnIndex + 0.5}
            cy={MAX_COLUMN_HEIGHT - disc.yPosition_.value - 0.5}
            r={0.5}
            fill={
              disc.playerType === 'PlayerOne' ? playerOneFill : playerTwoFill
            }
          />
        ))
      )}

      {/* {!disabled && ghost &&  (
        <circle
          cx={ghost.columnIndex + 0.5}
          cy={
            MAX_COLUMN_HEIGHT -
            (columns[ghost.columnIndex]?.length ?? 0) +
            0.5 -
            1
          }
          r={0.5}
          style={{ opacity: 2 / 3 }}
          fill={
            ghost.playerType === "PlayerOne" ? playerOneFill : playerTwoFill
          }
        />
      )} */}

      <rect
        x={0}
        y={0}
        width={COLUMN_COUNT}
        height={MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holeMask})`}
      />

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
    </svg>
  );
};

function isCanvas(i: unknown): i is HTMLCanvasElement {
  return i instanceof HTMLCanvasElement;
}

const ViewColumnsCanvas = ({ columns, onClick, visual }: ViewColumnsProps) => {
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

    paint({ context, columns, visual });
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
  visual,
}: {
  visual: VisualModel;
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

  for (x = 0; x < visual.length; x++) {
    const column = visual[x];
    if (!column) {
      continue;
    }
    for (y = 0; y < column.length; y++) {
      const disc = column[y];

      if (!disc) {
        continue;
      }

      cx = (x + 1 / 2) * cellWidth;
      cy = (disc.yPosition_.value + 1 / 2) * cellHeight;
      r = cellWidth / 2;

      context.beginPath();
      context.arc(cx, cy, r, 0, Math.PI * 2);
      try {
        gradient = context.createRadialGradient(cx, cy, 0, cx, cy, r * 0.74);
        gradient.addColorStop(0, gameTheme[disc.playerType].light);
        gradient.addColorStop(1, gameTheme[disc.playerType].dark);
        context.fillStyle = gradient;
      } catch (error) {
        context.fillStyle = gameTheme[disc.playerType].light;
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

export const step = ({
  nowMs,
  columns,
  current,
}: {
  nowMs: number;
  columns: Columns;
  current: VisualModel;
}): VisualModel => {
  const next: VisualModel = [];

  for (let x = 0; x < COLUMN_COUNT; x++) {
    const next_i: Disc[] = [];
    for (let y = 0; y < MAX_COLUMN_HEIGHT; y++) {
      const discTrue = columns[x]?.[y];
      const discVisual = current[x]?.[y];

      //
      // entry
      //
      if (!discVisual && discTrue) {
        next_i.push({
          type: 'entry',
          playerType: discTrue,
          yPosition_: Ease.init({
            from: MAX_COLUMN_HEIGHT + 1,
            to: y,
            durationMs: (0.2 + 0.1 * (1 - y / MAX_COLUMN_HEIGHT)) * 1000,
            easing: { type: 'ease-out-quint' },
          }),
        });
        continue;
      }

      //
      // exit
      //
      if (!discTrue && discVisual && discVisual.type !== 'exit') {
        next_i.push({
          ...discVisual,
          type: 'exit',
          yPosition_: Ease.init({
            from: y,
            to: -(MAX_COLUMN_HEIGHT - y),
            delayMs: (x / COLUMN_COUNT) * 0.33 * 1000,
            durationMs: 500,
            easing: { type: 'ease-in-back' },
          }),
        });
        continue;
      }

      const shouldRemove =
        discVisual &&
        discVisual.type === 'exit' &&
        Ease.isDone(nowMs, discVisual.yPosition_);

      if (discVisual && !shouldRemove) {
        next_i.push({
          ...discVisual,
          yPosition_: Ease.step(nowMs, discVisual.yPosition_),
        });
        continue;
      }
    }

    next.push(next_i);
  }

  return next;
};

export const initVisual = (columns: Columns): VisualModel => {
  const ret: VisualModel = [];

  for (let i = 0; i < COLUMN_COUNT; i++) {
    const ret_i: Disc[] = [];
    for (let j = 0; j < MAX_COLUMN_HEIGHT; j++) {
      const discTrue = columns[i]?.[j];
      if (discTrue) {
        ret_i.push({
          type: 'entry',
          playerType: discTrue,
          yPosition_: Ease.init({ from: j, to: j, durationMs: 0 }),
        });
      }
    }
    ret.push(ret_i);
  }

  return ret;
};

export const isDone = (nowMs: number, model: VisualModel): boolean => {
  for (let x = 0; x < model.length; x++) {
    const column = model[x];
    if (!column) {
      continue;
    }
    for (let y = 0; y < column.length; y++) {
      const discVisual = column[y];
      if (!discVisual) {
        continue;
      }

      if (!Ease.isDone(nowMs, discVisual.yPosition_)) {
        return false;
      }
    }
  }
  return true;
};
