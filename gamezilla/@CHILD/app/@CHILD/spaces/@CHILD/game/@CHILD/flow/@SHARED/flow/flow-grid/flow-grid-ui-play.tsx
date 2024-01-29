import { AlgoDrawPipes } from "../algo";
import * as Flow from "../flow";
import * as FlowGrid from "./flow-grid";
import * as FlowGridUI from "./flow-grid-ui";

//
//
//
// Model
//
//
//

type Idle = { t: "idle" };

type Dragging = {
  t: "dragging";
  activeGroupId: Flow.GroupId;
  autocompleteEdge?: FlowGrid.Edge | null;
};

type State = Idle | Dragging;

export type Model = {
  pipesBySourceId: FlowGrid.Model["flow"]["pipesBySourceId"];
  terminalsByGroupId: FlowGrid.Model["flow"]["terminalsByGroupId"];
  state: State;
};

//
//
//
//
//
//

export type Msg =
  | {
      t: "pressed-down";
      nodeId: Flow.NodeId;
    }
  | {
      t: "pressed-up";
      nodeId: Flow.NodeId;
    }
  | {
      t: "dragged-over";
      nodeId: Flow.NodeId;
    }
  | {
      t: "left";
    };

export const init = ({ grid }: { grid: FlowGrid.Model }): Model => {
  return {
    pipesBySourceId: grid.flow.pipesBySourceId,
    terminalsByGroupId: grid.flow.terminalsByGroupId,
    state: { t: "idle" },
  };
};

export const update = ({
  msg,
  model,
  grid,
}: {
  msg: Msg;
  model: Model;
  grid: FlowGrid.Model;
}): Model => {
  switch (model.state.t) {
    case "dragging": {
      return updateDragging({ grid, msg, model, state: model.state });
    }

    case "idle": {
      return updateIdle({ grid, msg, model });
    }
  }
};

export const toCurrentGrid = ({
  model,
  grid,
}: {
  grid: FlowGrid.Model;
  model: Model;
}): FlowGrid.Model => {
  return {
    ...grid,
    flow: {
      ...grid.flow,
      pipesBySourceId: model.pipesBySourceId,
      terminalsByGroupId: model.terminalsByGroupId,
    },
  };
};

const updateIdle: typeof update = ({ msg, model, grid }) => {
  switch (msg.t) {
    case "pressed-down": {
      const currentGrid = toCurrentGrid({ model, grid });

      const groupId = Flow.toGroupId(currentGrid.flow, msg.nodeId);

      if (!groupId) {
        return model;
      }

      const started = AlgoDrawPipes.startDrawPipes(
        FlowGrid.distance(currentGrid),
        currentGrid.flow,
        groupId,
        msg.nodeId
      );

      return {
        terminalsByGroupId: started.terminalsByGroupId,
        pipesBySourceId: started.pipesBySourceId,
        state: {
          t: "dragging",
          activeGroupId: groupId,
        },
      };
    }

    case "dragged-over": {
      return model;
    }

    case "pressed-up": {
      return model;
    }

    case "left": {
      return model;
    }
  }
};

const updateDragging = ({
  msg,
  state,
  model,
  grid,
}: {
  msg: Msg;
  model: Model;
  state: Dragging;
  grid: FlowGrid.Model;
}): Model => {
  switch (msg.t) {
    case "dragged-over": {
      const { nodeId } = msg;

      const currentGrid = toCurrentGrid({ model, grid });

      const extended = AlgoDrawPipes.drawPipes(
        FlowGrid.distance(currentGrid),
        currentGrid.flow,
        state.activeGroupId,
        nodeId
      );

      const modelNew: Model = {
        state: model.state,
        terminalsByGroupId: extended.terminalsByGroupId,
        pipesBySourceId: extended.pipesBySourceId,
      };

      return modelNew;
    }

    case "pressed-down": {
      return model;
    }

    case "pressed-up": {
      return { ...model, state: { t: "idle" } };
    }

    case "left": {
      return { ...model, state: { t: "idle" } };
    }
  }
};

//
//
//
// View
//
//
//

export const View = ({
  model,
  emit,
  disabled,
  grid,
}: {
  grid: FlowGrid.Model;
  model: Model;
  emit: (m: Msg) => void;
  disabled?: boolean;
}) => {
  return (
    <FlowGridUI.View
      disabled={disabled}
      model={toCurrentGrid({ model, grid })}
      showCoordinates={false}
      isDragging={model.state.t === "dragging"}
      onDraggedOver={(nodeId) => emit({ t: "dragged-over", nodeId })}
      onPressDown={(nodeId) => emit({ t: "pressed-down", nodeId })}
      onPressUp={(nodeId) => emit({ t: "pressed-up", nodeId })}
      onLeave={() => emit({ t: "left" })}
      autocompleteEdge={
        model.state.t === "dragging" && model.state.autocompleteEdge
          ? {
              ...model.state.autocompleteEdge,
              groupId: model.state.activeGroupId,
            }
          : null
      }
      isActive={({ groupId }) =>
        model.state.t === "dragging" && model.state.activeGroupId === groupId
      }
    />
  );
};
