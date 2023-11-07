import { NonEmpty } from "gamezilla/@SHARED/core";
import * as Flow from "../flow";
import * as FlowGrid from "./flow-grid";

export type Model = NonEmpty<NonEmpty<Flow.GroupId | null>>;

type DraftTerminal = {
  groupId: Flow.GroupId;
  startId: Flow.NodeId;
  endId: Flow.NodeId | null;
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

  const draftTerminals: { [groupId in Flow.GroupId]?: DraftTerminal } = {};

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

      const groupId = row[x];

      if (!groupId) {
        continue;
      }

      const draftTerminal = draftTerminals[groupId];

      if (!draftTerminal) {
        const draftTerminalNew: DraftTerminal = {
          groupId,
          startId: nodeId,
          endId: null,
        };
        draftTerminals[groupId] = draftTerminalNew;
        continue;
      }

      const terminal: Flow.Terminal = {
        groupId,
        startId: draftTerminal.startId,
        endId: nodeId,
      };

      grid = Flow.addTerminal(grid, terminal);
    }
  }

  return grid;
};
