import { NonEmpty } from "@gamezilla/shared/core";
import { GroupId } from "../flow/flow";
import * as FlowGrid from "./flow-grid";
import { Flow } from "../flow";

export type Model = NonEmpty<NonEmpty<GroupId | null>>;

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
      const groupId = row[x];

      const nodeId = FlowGrid.positionToId({
        x,
        y,
      });

      grid = FlowGrid.addNodeFromPosition(grid, {
        x,
        y,
      });

      if (!groupId) {
        continue;
      }
      const terminal = Flow.groupIdToTerminal(grid, groupId);

      if (!terminal) {
        grid = Flow.setTerminalStartNode(grid, nodeId, groupId);
        continue;
      }

      grid = Flow.setTerminalEndNode(grid, nodeId, groupId);
    }
  }

  return grid;
};
