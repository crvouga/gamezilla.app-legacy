import { AlgoDrawPipes } from "../algo";
import * as Flow from "../flow";
import * as FlowGrid from "./flow-grid";
import { samples } from "./flow-grid-samples";
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
  grid: FlowGrid.Model;
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

export const init = (): Model => {
  return {
    grid: samples["6x6"][1],
    state: { t: "idle" },
  };
};

export const update = ({ msg, model }: { msg: Msg; model: Model }): Model => {
  switch (model.state.t) {
    case "dragging": {
      return updateDragging({ msg, model, state: model.state });
    }

    case "idle": {
      return updateIdle({ msg, model });
    }
  }
};

const updateIdle: typeof update = ({ msg, model }) => {
  switch (msg.t) {
    case "pressed-down": {
      const groupId = Flow.toGroupId(model.grid.flow, msg.nodeId);

      if (!groupId) {
        return model;
      }

      const started = AlgoDrawPipes.startDrawPipes(
        model.grid.flow,
        groupId,
        msg.nodeId
      );

      return {
        ...model,
        grid: {
          ...model.grid,
          flow: started,
        },
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
}: {
  msg: Msg;
  model: Model;
  state: Dragging;
}): Model => {
  switch (msg.t) {
    case "dragged-over": {
      const { nodeId } = msg;

      const extended = AlgoDrawPipes.drawPipes(
        model.grid.flow,
        state.activeGroupId,
        nodeId
      );

      const gridNew: FlowGrid.Model = {
        ...model.grid,
        flow: extended,
      };

      const modelNew: Model = {
        ...model,
        grid: gridNew,
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
  dispatch,
}: {
  model: Model;
  dispatch: (m: Msg) => void;
}) => {
  return (
    <div class="flex w-full flex-col gap-4 overflow-y-auto">
      <FlowGridUI.View
        model={model.grid}
        showCoordinates={false}
        isDragging={model.state.t === "dragging"}
        onDraggedOver={(nodeId) => dispatch({ t: "dragged-over", nodeId })}
        onPressDown={(nodeId) => dispatch({ t: "pressed-down", nodeId })}
        onPressUp={(nodeId) => dispatch({ t: "pressed-up", nodeId })}
        onLeave={() => dispatch({ t: "left" })}
        autocompleteEdge={
          model.state.t === "dragging" && model.state.autocompleteEdge
            ? {
                ...model.state.autocompleteEdge,
                groupId: model.state.activeGroupId,
              }
            : null
        }
        class={model.state.t === "dragging" ? "cursor-grabbing" : "cursor-grab"}
        isActive={({ groupId }) =>
          model.state.t === "dragging" && model.state.activeGroupId === groupId
        }
      />
    </div>
  );
};
