import { rescale } from "gamezilla/@SHARED/core";
import {
  COLUMN_COUNT,
  Columns,
  isColumnIndex,
  MAX_COLUMN_HEIGHT,
} from "../../connect-four";
import { gameTheme } from "../shared";
import { ViewColumnsProps } from "./shared";

export const doPaint = (columns: Columns) => {
  const canvas = document.getElementById("view-columns-canvas");

  if (!canvas) {
    return;
  }

  if (!isCanvas(canvas)) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.canvas.height =
    (MAX_COLUMN_HEIGHT / COLUMN_COUNT) * context.canvas.width;

  paint({ context, columns });
};

export const ViewColumnsCanvas = ({ onClick }: ViewColumnsProps) => {
  return (
    <canvas
      id="view-columns-canvas"
      className="w-full cursor-pointer"
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
  context.fillStyle = "purple";
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
  context.fill("evenodd");
};

function isCanvas(i: unknown): i is HTMLCanvasElement {
  return i instanceof HTMLCanvasElement;
}
