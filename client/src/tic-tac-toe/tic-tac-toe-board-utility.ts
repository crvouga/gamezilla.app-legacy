import { cartesianProduct, range } from "../utility";

export const toBoardLines = ({
  rowCount,
  columnCount,
}: {
  rowCount: number;
  columnCount: number;
}): {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}[] => {
  const vertical = range(1, columnCount).map((column) => ({
    x1: 0,
    y1: column,
    x2: columnCount,
    y2: column,
  }));

  const horizontal = range(1, rowCount).map((row) => ({
    x1: row,
    y1: 0,
    x2: row,
    y2: rowCount,
  }));

  return vertical.concat(horizontal);
};

export type BoardPosition = {
  column: number;
  row: number;
};
export const toBoardPositions = ({
  rowCount,
  columnCount,
}: {
  rowCount: number;
  columnCount: number;
}): BoardPosition[] => {
  return cartesianProduct(
    range(0, columnCount),
    range(0, rowCount)
  ).map(([column, row]) => ({ column, row }));
};
