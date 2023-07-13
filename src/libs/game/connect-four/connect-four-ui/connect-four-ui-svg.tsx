import { memoize } from "@gamezilla/shared/core";
import { Transition, TransitionGroup } from "react-transition-group";
import {
  COLUMN_COUNT,
  Columns,
  MAX_COLUMN_HEIGHT,
  Position,
  isColumnIndex,
  toWins,
} from "../connect-four";
import { ViewColumnsProps, gameTheme } from "./connect-four-ui-shared";

type SvgIds = {
  playerOneGradient: string;
  playerTwoGradient: string;
  holePattern: string;
  columnGradient: string;
  holeMask: string;
};

const randomId = Math.random();
const ids = {
  playerOneGradient: `playerOneGradient${randomId}`,
  playerTwoGradient: `playerTwoGradient${randomId}`,
  holePattern: `holePattern${randomId}`,
  columnGradient: `columnGradient${randomId}`,
  holeMask: `holeMask${randomId}`,
};

export const ViewColumnsSvg = ({
  columns,
  onClick,
  onHover,
  disabled,
}: ViewColumnsProps) => {
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

        <TransitionGroup component={"g"} transform="translate(0.5, 0.5)">
          {columns.flatMap((column, x) =>
            column.map((disc, y) => (
              <Transition
                component="g"
                key={`${x} ${y} ${disc}`}
                addEndListener={() => {
                  //
                }}
                onEnter={onEnter({ y })}
                onExit={onExit({ x, y })}>
                <circle
                  cx={x}
                  cy={y}
                  r={0.5}
                  fill={disc === "PlayerOne" ? playerOneFill : playerTwoFill}
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
                  ? "not-allowed"
                  : "pointer",
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

const memoizedWins = memoize(
  (columns) => columns.map((x) => x.join(",")).join(","),
  toWins
);

const ViewWins = ({ columns }: { columns: Columns }) => {
  const wins = memoizedWins(columns);

  return (
    <svg
      x={0}
      y={0}
      width={COLUMN_COUNT}
      height={MAX_COLUMN_HEIGHT}
      viewBox={`0 0 ${COLUMN_COUNT * n} ${MAX_COLUMN_HEIGHT * n}`}>
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
              onExit={undraw}>
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
  node.style.strokeDasharray = length.toString();
  node.style.strokeDashoffset = length.toString();

  node.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
    duration: 500,
    easing: "ease-in-out",
    fill: "both",
  });
};

const undraw = (node: HTMLElement) => {
  if (!(node instanceof SVGRectElement)) {
    return;
  }
  const length = node.getTotalLength();
  node.style.strokeDasharray = length.toString();
  node.style.strokeDashoffset = "0";

  node.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: length }], {
    duration: 500,
    easing: "ease-in-out",
    fill: "both",
  });
};

const onEnter =
  ({ y }: { y: number }) =>
  async (node: HTMLElement) => {
    node.animate([{ cy: `${MAX_COLUMN_HEIGHT + 1}` }, { cy: `${y}` }], {
      duration: 200 + 300 * (1 - y / MAX_COLUMN_HEIGHT),
      easing: "ease-in-out",
      fill: "both",
    });
  };

const onExit =
  ({ x, y }: { x: number; y: number }) =>
  async (node: HTMLElement) => {
    node.animate([{ cy: `${y}` }, { cy: `${y - MAX_COLUMN_HEIGHT}` }], {
      duration: 750,
      easing: "ease-in-out",
      delay: (x / COLUMN_COUNT) * 500,
      fill: "both",
    });
  };

const SvgDefs = ({ ids }: { ids: SvgIds }) => {
  return (
    <defs>
      <pattern
        id={ids.holePattern}
        patternUnits="userSpaceOnUse"
        width={1}
        height={1}>
        <circle cx={0.5} cy={0.5} r={0.425} fill="black"></circle>
      </pattern>

      <mask id={ids.holeMask}>
        <rect
          x={0}
          y={0}
          width={COLUMN_COUNT}
          height={MAX_COLUMN_HEIGHT}
          fill="white"></rect>
        <rect
          x={0}
          y={0}
          width={COLUMN_COUNT}
          height={MAX_COLUMN_HEIGHT}
          fill={`url(#${ids.holePattern})`}></rect>
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
