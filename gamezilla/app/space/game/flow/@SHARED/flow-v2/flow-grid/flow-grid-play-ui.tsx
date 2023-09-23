import { Eff } from "gamezilla/@SHARED/core";
import { Flow } from "..";
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
  | {
      t: "idle";
    }
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
  switch (model.state.t) {
    case "dragging": {
      return updateDragging({ msg, model });
    }

    case "idle": {
      return updateIdle({ msg, model });
    }
  }
};

const updateIdle = ({ msg, model }: { msg: Msg; model: Model }): Model => {
  switch (msg.t) {
    case "dragged-over": {
      return model;
    }
    case "mouse-leave": {
      return model;
    }
    case "pressed-down-node": {
      return model;
    }
    case "pressed-up": {
      return model;
    }
  }
};

const updateDragging = ({ msg, model }: { msg: Msg; model: Model }): Model => {
  switch (msg.t) {
    case "dragged-over": {
      return model;
    }
    case "mouse-leave": {
      return model;
    }
    case "pressed-down-node": {
      return model;
    }
    case "pressed-up": {
      return model;
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
    <FlowGridUI.View
      model={{ ...model.grid }}
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
