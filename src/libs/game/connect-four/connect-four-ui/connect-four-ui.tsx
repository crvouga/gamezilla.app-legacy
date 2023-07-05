import { Uuid } from "@gamezilla/shared/core";
import { useRef } from "react";
import { COLUMN_COUNT, MAX_COLUMN_HEIGHT, PlayerType } from "../connect-four";
import { ViewColumnsCanvas } from "./connect-four-ui-canvas";
import { gameTheme, ViewColumnsProps } from "./connect-four-ui-shared";
import { ViewColumnsSvg } from "./connect-four-ui-svg";
import { ViewColumnsDOM } from "./connect-four-ui-react-dom";

//
//
//
//
//
//
//
//

export const ViewColumns = ({
  implementation = "svg",
  ...props
}: ViewColumnsProps & {
  implementation?: "svg" | "canvas" | "dom";
}) => {
  switch (implementation) {
    case "canvas": {
      return <ViewColumnsCanvas {...props} />;
    }

    case "svg": {
      return <ViewColumnsSvg {...props} />;
    }

    case "dom": {
      return <ViewColumnsDOM {...props} />;
    }
  }
};

//
//
//
//
//
//
//
//
//
//

export const ViewCoverArt = (props: { className?: string }) => {
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
    <svg width="100%" viewBox={"0 0 2 2"} {...props}>
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

        <linearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)">
          <stop offset="0%" stopColor={gameTheme.PlayerOne.light} />
          <stop offset="100%" stopColor={gameTheme.PlayerOne.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)">
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

//
//
//
//
//
//
//
//
//
//

export const PlayerIcon = ({
  playerType,
  ...props
}: {
  playerType: PlayerType;
  key?: string;
  className?: string;
}) => {
  switch (playerType) {
    case "PlayerOne": {
      return <PlayerOneIcon {...props} />;
    }

    case "PlayerTwo": {
      return <PlayerTwoIcon {...props} />;
    }
  }
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
      r={r}>
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
      <stop offset="50%" stopColor={gameTheme.PlayerTwo.light} />
      <stop offset="100%" stopColor={gameTheme.PlayerTwo.dark} />
    </radialGradient>
  );
};

export const PlayerOneIcon = (props: { key?: string; className?: string }) => {
  const ref = useRef(Uuid.generateSync());
  return (
    <svg viewBox="-1 -1 2 2" {...props}>
      <ViewPlayerOneGradientDef cx={0} cy={0} r={1} gradientId={ref.current} />
      <circle cx={0} cy={0} r={1} fill={`url(#${ref.current})`} />
    </svg>
  );
};

export const PlayerTwoIcon = (props: { key?: string; className?: string }) => {
  const ref = useRef(Uuid.generateSync());
  return (
    <svg viewBox="-1 -1 2 2" className="h-6 w-6" {...props}>
      <ViewPlayerTwoGradientDef gradientId={ref.current} />
      <circle cx={0} cy={0} r={1} fill={`url(#${ref.current})`} />
    </svg>
  );
};
