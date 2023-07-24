import { Cmd } from "@gamezilla/core";
import { Flow, AlgoDrawPath, AlgoAutocompletePath } from "../flow";
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
      activePathId: Flow.PathId;
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
  cmd?: Cmd;
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

      const pathId = Flow.findPath(model.grid, pressedNodeId);
      const pathTerminal = Flow.findPathTerminal(model.grid, pressedNodeId);

      const activePathId = pathId ?? pathTerminal?.pathId ?? null;

      if (!activePathId) {
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
          activePathId,
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
        model.state.activePathId,
        msg.nodeId
      );

      const autocompleteEdge = AlgoAutocompletePath.toAutocompleteEdge(
        gridNew,
        model.state.activePathId
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
      model.state.activePathId,
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
      model={{ ...model.grid, draftTerminals: model.grid.pathTerminals }}
      onDraggedOver={(nodeId) => dispatch({ t: "dragged-over", nodeId })}
      onPressDown={(nodeId) => dispatch({ t: "pressed-down-node", nodeId })}
      onPressUp={(nodeId) => dispatch({ t: "pressed-up", nodeId })}
      autocompleteEdge={
        model.state.t === "dragging" && model.state.autocompleteEdge
          ? {
              ...model.state.autocompleteEdge,
              pathId: model.state.activePathId,
            }
          : null
      }
      className={
        model.state.t === "dragging" ? "cursor-grabbing" : "cursor-grab"
      }
      isActive={({ pathId }) =>
        model.state.t === "dragging" && model.state.activePathId === pathId
      }
    />
  );
};
