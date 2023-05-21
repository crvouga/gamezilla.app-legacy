import { SvgIcon, Sx } from '@gamezilla/shared/ui';
import {
  Board,
  Empty,
  MAX_X,
  MAX_Y,
  PlayerType,
  Position,
  Slot,
  allPositions,
  toSlot,
} from './tic-tac-toe';

export const gameTheme = {
  background: '#14BDAC',
  line: '#0DA192',
  cross: '#545454',
  naught: '#F2EBD3',
  text: '#fff',
};

const scale = 1_000;

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
      viewBox={[0, 0, MAX_X * scale, MAX_Y * scale].join(' ')}
      style={{
        backgroundColor: gameTheme.background,
      }}
    >
      <g>
        {lines.map((line, index) => (
          <line
            key={index}
            x1={line.x1 * scale}
            y1={line.y1 * scale}
            x2={line.x2 * scale}
            y2={line.y2 * scale}
            stroke={gameTheme.line}
            strokeWidth={0.1 * scale}
          />
        ))}
      </g>

      {board.map((slots, x) =>
        slots.flatMap((slot, y) => {
          return (
            <ViewSlot
              cx={x * scale + scale / 2}
              cy={y * scale + scale / 2}
              r={0.3 * scale}
              slot={slot}
              key={[x, y, slot].join(' ')}
              strokeWidth={0.1 * scale}
            />
          );
        })
      )}

      {allPositions.map((position) => (
        <rect
          key={[position.column, position.row, toSlot(board, position)].join(
            ' '
          )}
          style={{
            cursor: 'pointer',
          }}
          x={Number(position.column) * scale}
          y={Number(position.row) * scale}
          width={1 * scale}
          height={1 * scale}
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
        key={playerType}
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
