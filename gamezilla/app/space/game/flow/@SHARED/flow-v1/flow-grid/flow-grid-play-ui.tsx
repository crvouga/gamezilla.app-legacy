import { Eff } from "gamezilla/@SHARED/core";
import { Flow, AlgoDrawPath, AlgoAutocompletePath } from "..";
import * as FlowGrid from "./flow-grid";
import * as FlowGridUI from "./flow-grid-ui";

//
//
//
// Model
//
//
//

export type Model = {
  grid: FlowGrid.Model;
  state: State;
};

type State =
  | { t: "idle" }
  | {
      t: "dragging";
      activeGroupId: Flow.GroupId;
      autocompleteEdge?: FlowGrid.Edge | null;
    };

export const init = (grid: FlowGrid.Model): Model => ({
  state: { t: "idle" },
  grid,
});

//
//
//
// Update
//
//
//

export type Msg =
  | { t: "dragged-over"; nodeId: Flow.NodeId }
  | { t: "pressed-down-node"; nodeId: Flow.NodeId }
  | { t: "pressed-up"; nodeId: Flow.NodeId }
  | { t: "mouse-leave" };

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff;
} => {
  return {
    model: updateModel({ msg, model }),
  };
};

export const updateModel = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): Model => {
  if (model.state.t === "idle") {
    if (msg.t === "pressed-down-node") {
      const pressedNodeId = msg.nodeId;

      const groupId = Flow.findGroup(model.grid, pressedNodeId);

      const terminal = Flow.findTerminal(model.grid, pressedNodeId);

      const activeGroupId = groupId ?? terminal?.groupId ?? null;

      if (!activeGroupId) {
        return {
          ...model,
          state: { t: "idle" },
        };
      }

      return {
        ...model,
        grid: AlgoDrawPath.startPath(model.grid, pressedNodeId),
        state: {
          t: "dragging",
          activeGroupId,
          autocompleteEdge: null,
        },
      };
    }

    return model;
  }

  if (model.state.t === "dragging") {
    if (msg.t === "dragged-over") {
      const gridNew = AlgoDrawPath.extendPath(
        model.grid,
        model.state.activeGroupId,
        msg.nodeId
      );

      const autocompleteEdge = AlgoAutocompletePath.toAutocompleteEdge(
        gridNew,
        model.state.activeGroupId
      );

      const autocompleteGridEdge = autocompleteEdge
        ? FlowGrid.toEdge(gridNew, Flow.toEdgeId(autocompleteEdge))
        : null;

      return {
        ...model,
        grid: gridNew,
        state: {
          ...model.state,
          autocompleteEdge: autocompleteGridEdge,
        },
      };
    }

    if (msg.t === "pressed-up") {
      return { ...addAutocompleteEdge(model), state: { t: "idle" } };
    }

    if (msg.t === "mouse-leave") {
      return { ...addAutocompleteEdge(model), state: { t: "idle" } };
    }

    return model;
  }

  return model;
};

const addAutocompleteEdge = (model: Model): Model => {
  if (model.state.t === "dragging" && model.state.autocompleteEdge) {
    const gridNew = AlgoDrawPath.extendPath(
      model.grid,
      model.state.activeGroupId,
      model.state.autocompleteEdge.target
    );
    return {
      ...model,
      grid: gridNew,
    };
  }
  return model;
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
    <FlowGridUI.View
      model={{ ...model.grid, draftTerminals: model.grid.terminals }}
      onDraggedOver={(nodeId) => dispatch({ t: "dragged-over", nodeId })}
      onPressDown={(nodeId) => dispatch({ t: "pressed-down-node", nodeId })}
      onPressUp={(nodeId) => dispatch({ t: "pressed-up", nodeId })}
      autocompleteEdge={
        model.state.t === "dragging" && model.state.autocompleteEdge
          ? {
              ...model.state.autocompleteEdge,
              groupId: model.state.activeGroupId,
            }
          : null
      }
      className={
        model.state.t === "dragging" ? "cursor-grabbing" : "cursor-grab"
      }
      isActive={({ groupId }) =>
        model.state.t === "dragging" && model.state.activeGroupId === groupId
      }
    />
  );
};
