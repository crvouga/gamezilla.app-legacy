import { Flow, FlowAlgoPath } from "../flow";
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
      return updatePressedDown({ model, nodeId: msg.nodeId });
    }

    return model;
  }

  if (model.state.t === "dragging") {
    if (msg.t === "dragged-over") {
      const gridNew = FlowAlgoPath.extendPath(
        model.grid,
        model.state.activeGroupId,
        msg.nodeId
      );

      const autocompleteEdge = FlowAlgoPath.toAutocompleteEdge(
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

    if (msg.t === "pressed-down-node") {
      return updatePressedDown({ model, nodeId: msg.nodeId });
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
    const gridNew = FlowAlgoPath.extendPath(
      model.grid,
      model.state.activeGroupId,
      model.state.autocompleteEdge.to
    );
    return {
      ...model,
      grid: gridNew,
    };
  }
  return model;
};

const updatePressedDown = ({
  model,
  nodeId,
}: {
  nodeId: Flow.NodeId;
  model: Model;
}): Model => {
  const terminal = Flow.nodeIdToTerminal(model.grid, nodeId);
  if (terminal) {
    return {
      ...model,
      grid: FlowAlgoPath.startPath(model.grid, nodeId),
      state: {
        t: "dragging",
        activeGroupId: terminal.groupId,
        autocompleteEdge: null,
      },
    };
  }

  const groupId = Flow.toGroup(model.grid, nodeId);

  if (groupId) {
    return {
      ...model,
      grid: FlowAlgoPath.extendPath(model.grid, groupId, nodeId),
      state: {
        t: "dragging",
        autocompleteEdge: null,
        activeGroupId: groupId,
      },
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
  $send,
}: {
  model: Model;
  $send: (m: Msg) => void;
}) => {
  return (
    <FlowGridUI.View
      model={model.grid}
      onDraggedOver={(nodeId) => $send({ t: "dragged-over", nodeId })}
      onPressDown={(nodeId) => $send({ t: "pressed-down-node", nodeId })}
      onPressUp={(nodeId) => $send({ t: "pressed-up", nodeId })}
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
