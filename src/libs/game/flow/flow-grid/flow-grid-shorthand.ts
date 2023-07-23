import { NonEmpty } from "@gamezilla/core";
import { Flow } from "../flow";
import { PathId } from "../flow/flow";
import * as FlowGrid from "./flow-grid";

export type Model = NonEmpty<NonEmpty<PathId | null>>;

export const fromShorthand = (model: Model): FlowGrid.Model => {
  let grid = FlowGrid.initEmpty({
    bounds: {
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: model[0].length,
        y: model.length,
      },
    },
  });

  for (let y = 0; y < model.length; y++) {
    const row = model[y];

    if (!row) {
      continue;
    }

    for (let x = 0; x < row.length; x++) {
      const pathId = row[x];

      const nodeId = FlowGrid.positionToId({
        x,
        y,
      });

      grid = FlowGrid.addNodeFromPosition(grid, {
        x,
        y,
      });

      if (!pathId) {
        continue;
      }
      const terminal = grid.terminals[pathId];

      if (!terminal) {
        grid = Flow.setTerminalStartNode(grid, nodeId, pathId);
        continue;
      }

      grid = Flow.setTerminalEndNode(grid, nodeId, pathId);
    }
  }

  return grid;
};
