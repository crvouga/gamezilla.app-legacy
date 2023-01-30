import { Ease, rescale } from '@gamezilla/core';
import { SvgIcon, Sx } from '@gamezilla/shared/ui';
import {
  allPositions,
  Board,
  Empty,
  MAX_X,
  MAX_Y,
  PlayerType,
  Position,
  Slot,
  toSlot,
} from './tic-tac-toe';

//
//
// Model
//
//

export type VisualModel = (VisualSlot | null)[][];

export type VisualSlot = {
  type: 'enter' | 'exit';
  lineLength: Ease.Model;
  playerType: PlayerType;
};

export const initVisual = ({ board }: { board: Board }) => {
  return board;
};

export const step = ({
  board,
  model,
  nowMs,
}: {
  nowMs: number;
  board: Board;
  model: VisualModel;
}): VisualModel => {
  const modelNew: VisualModel = [];

  for (let x = 0; x < MAX_X; x++) {
    const modelNewX: (VisualSlot | null)[] = [];
    for (let y = 0; y < MAX_Y; y++) {
      const slotTrue = board[x]?.[y];
      const slotVisual = model[x]?.[y];

      //
      // Enter
      //
      if (slotTrue && slotTrue !== '_' && !slotVisual) {
        modelNewX.push({
          type: 'enter',
          playerType: slotTrue,
          lineLength: Ease.init({
            durationMs: 1000,
            from: 0,
            to: 0.8,
            startMs: nowMs,
          }),
        });
        continue;
      }

      //
      // Exit
      //
      if (!slotTrue && slotVisual) {
        modelNewX.push({
          type: 'exit',
          playerType: slotVisual.playerType,
          lineLength: Ease.init({
            durationMs: 1000,
            from: 0.8,
            to: 0,
            startMs: nowMs,
          }),
        });
        continue;
      }

      //
      // Update
      //
      if (slotTrue && slotVisual) {
        modelNewX.push({
          type: 'enter',
          playerType: slotVisual.playerType,
          lineLength: Ease.step(nowMs, slotVisual.lineLength),
        });
        continue;
      }

      //
      //
      //
      modelNewX.push(null);
    }
  }

  return modelNew;
};

export const isAnimating = ({
  model,
  nowMs,
}: {
  nowMs: number;
  model: VisualModel;
}) => {
  for (let x = 0; x < MAX_X; x++) {
    for (let y = 0; y < MAX_Y; y++) {
      const slotVisual = model[x]?.[y];
      if (slotVisual && Ease.isAnimating(nowMs, slotVisual.lineLength)) {
        return true;
      }
    }
  }
  return false;
};

//
//
//
//
//

export const gameTheme = {
  background: '#14BDAC',
  line: '#0DA192',
  cross: '#545454',
  naught: '#F2EBD3',
  text: '#fff',
};

export const ViewBoard = ({
  board,
  onClick,
}: {
  board: Board;
  onClick: (position: Position) => void;
}) => {
  return (
    <svg
      width={'100%'}
      viewBox="0 0 3 3"
      style={{
        backgroundColor: gameTheme.background,
      }}
    >
      <g>
        {lines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={gameTheme.line}
            strokeWidth={0.1}
          />
        ))}
      </g>

      {allPositions.map((position) => (
        <ViewSlot
          key={[position.column, position.row, toSlot(board, position)].join(
            ' '
          )}
          slot={toSlot(board, position)}
          cx={Number(position.column) + 0.5}
          cy={Number(position.row) + 0.5}
          r={0.3}
        />
      ))}

      {allPositions.map((position) => (
        <rect
          key={[position.column, position.row, toSlot(board, position)].join(
            ' '
          )}
          style={{
            cursor: 'pointer',
          }}
          x={Number(position.column)}
          y={Number(position.row)}
          width={1}
          height={1}
          onClick={() => onClick(position)}
          fill="transparent"
        />
      ))}
    </svg>
  );
};

const lines = [
  { x1: 1, y1: 0, x2: 1, y2: 3 },
  { x1: 2, y1: 0, x2: 2, y2: 3 },
  { x1: 0, y1: 1, x2: 3, y2: 1 },
  { x1: 0, y1: 2, x2: 3, y2: 2 },
];

const distance = (
  a: { x: number; y: number },
  b: { x: number; y: number }
): number => {
  return Math.sqrt(Math.pow(a.x - b.y, 2) + Math.pow(a.y - b.y, 2));
};

export const viewSlotVisual = ({
  slot,
  cx,
  cy,
  r,
  color,
  strokeWidth,
  percentageDrew,
}: {
  color?: string;
  strokeWidth?: number;
  slot: VisualSlot;
  r: number;
  cx: number;
  cy: number;
  percentageDrew: number;
}) => {
  switch (slot.playerType) {
    case 'X': {
      const length = distance(
        { x: cx - r, y: cy - r },
        { x: cx + r, y: cy + r }
      );

      const dashoffset = rescale({
        value: percentageDrew,
        from: [0, 1],
        to: [length, 0],
      });

      return (
        <g strokeWidth={strokeWidth} stroke={color}>
          {/*

          direction: \

          */}
          <line
            x1={cx - r}
            y1={cy - r}
            x2={cx + r}
            y2={cy + r}
            strokeDasharray={length}
            strokeDashoffset={dashoffset}
          />
          {/*

          direction: /

          */}
          <line
            x1={cx + r}
            y1={cy - r}
            x2={cx - r}
            y2={cy + r}
            strokeDasharray={length}
            strokeDashoffset={dashoffset}
          />
        </g>
      );
    }

    /**

       { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0 }

     */

    case 'O': {
      const circumference = 2 * Math.PI * r;
      const dashoffset = rescale({
        value: percentageDrew,
        from: [0, 1],
        to: [0, circumference],
      });
      return (
        <circle
          r={r}
          cx={cx}
          cy={cy}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          fill="transparent"
        />
      );
    }
  }
};
export const ViewSlot = ({
  slot,
  cx,
  cy,
  r,
  color,
  strokeWidth,
}: {
  color?: string;
  strokeWidth?: number;
  slot: Slot;
  r: number;
  cx: number;
  cy: number;
}) => {
  switch (slot) {
    case Empty:
      return <g></g>;

    case 'O':
      return (
        <Naught strokeWidth={strokeWidth} color={color} r={r} cx={cx} cy={cy} />
      );

    case 'X':
      return (
        <Cross strokeWidth={strokeWidth} color={color} r={r} cx={cx} cy={cy} />
      );
  }
};

const Cross = ({
  cx,
  cy,
  r,
  color = gameTheme.cross,
  strokeWidth = 0.1,
}: {
  color?: string;
  r: number;
  cx: number;
  cy: number;
  strokeWidth?: number;
}) => {
  return (
    <g strokeWidth={strokeWidth} stroke={color}>
      {/* direction: \ */}
      <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
      {/* direction: / */}
      <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} />
    </g>
  );
};

const Naught = ({
  cx,
  cy,
  r,
  color = gameTheme.naught,
  strokeWidth = 0.1,
}: {
  color?: string;
  strokeWidth?: number;
  r: number;
  cx: number;
  cy: number;
}) => {
  return (
    <circle
      r={r}
      cx={cx}
      cy={cy}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="transparent"
    />
  );
};

export const PlayerTypeIcon = ({
  playerType,
  sx,
}: {
  playerType: PlayerType;
  sx?: Sx;
}) => {
  return (
    <SvgIcon viewBox="-1 -1 2 2" sx={sx}>
      <ViewSlot
        cx={0}
        cy={0}
        slot={playerType}
        r={2 / 3}
        color="currentColor"
        strokeWidth={0.33}
      />
    </SvgIcon>
  );
};

export const viewCoverArt = () => {
  const positions: [Position, Slot][] = [
    [{ row: 0, column: 0 }, 'X'],
    [{ row: 0, column: 1 }, Empty],
    [{ row: 1, column: 0 }, Empty],
    [{ row: 1, column: 1 }, 'O'],
  ];

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const;

  return (
    <svg width="100%" viewBox="0 0 2 2">
      <rect x={0} y={0} width={2} height={2} fill={gameTheme.background} />

      {LINES.map((line, index) => (
        <line key={index} {...line} stroke={gameTheme.line} strokeWidth={0.1} />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <ViewSlot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  );
};
