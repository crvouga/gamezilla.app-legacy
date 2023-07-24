import { NonEmpty } from "@gamezilla/core";
import { Flow } from "../flow";
import { NodeId, PathId, PathTerminal } from "../flow/flow";
import * as FlowGrid from "./flow-grid";

export type Model = NonEmpty<NonEmpty<PathId | null>>;

type DraftTerminal = {
  pathId: PathId;
  startId: NodeId;
  endId: NodeId | null;
};

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

  const draftTerminals: { [pathId in PathId]?: DraftTerminal } = {};

  for (let y = 0; y < model.length; y++) {
    const row = model[y];

    if (!row) {
      continue;
    }

    for (let x = 0; x < row.length; x++) {
      const position = {
        x,
        y,
      };

      const nodeId = FlowGrid.positionToId(position);

      grid = FlowGrid.addNode(grid, position);

      const pathId = row[x];

      if (!pathId) {
        continue;
      }

      const draftTerminal = draftTerminals[pathId];

      if (!draftTerminal) {
        const draftTerminalNew: DraftTerminal = {
          pathId,
          startId: nodeId,
          endId: null,
        };
        draftTerminals[pathId] = draftTerminalNew;
        continue;
      }

      const terminal: PathTerminal = {
        pathId,
        startId: draftTerminal.startId,
        endId: nodeId,
      };

      grid = Flow.addTerminal(grid, terminal);
    }
  }

  return grid;
};
