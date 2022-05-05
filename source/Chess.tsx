import * as React from "react";

export const theme = {
  background: "#14BDAC",
  line: "#0DA192",
  cross: "#545454",
  naught: "#F2EBD3",
  lightSquare: "#EBEBD0",
  darkSquare: "#779455",
};

const Slot = ({
  slot,
  cx,
  cy,
  r,
}: {
  slot: "X" | "O" | "Empty";
  r: number;
  cx: number;
  cy: number;
}) => {
  return {
    Empty: () => <></>,
    X: () => Cross({ r, cx, cy }),
    O: () => Naught({ r, cx, cy }),
  }[slot]();
};

const Cross = ({ cx, cy, r }: { r: number; cx: number; cy: number }) => {
  return (
    <g strokeWidth={0.1} stroke={theme.cross}>
      {/* direction: \ */}
      <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
      {/* direction: / */}
      <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} />
    </g>
  );
};

const Naught = ({ cx, cy, r }: { r: number; cx: number; cy: number }) => {
  return (
    <circle
      r={r}
      cx={cx}
      cy={cy}
      stroke={theme.naught}
      strokeWidth={0.1}
      fill="transparent"
    />
  );
};

export const Icon = () => {
  const positions = [
    [{ row: "0", column: "0" }, "X"] as const,
    [{ row: "0", column: "1" }, "Empty"] as const,
    [{ row: "1", column: "0" }, "Empty"] as const,
    [{ row: "1", column: "1" }, "O"] as const,
  ] as const;

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const;

  return (
    <svg width="100%" height="100%" viewBox="0 0 2 2">
      <rect x={0} y={0} width={1} height={1} fill={theme.lightSquare} />

      <rect x={0} y={1} width={1} height={1} fill={theme.darkSquare} />

      <rect x={1} y={1} width={1} height={1} fill={theme.lightSquare} />

      <rect x={1} y={0} width={1} height={1} fill={theme.darkSquare} />
    </svg>
  );
};
