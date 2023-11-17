import { Eff } from "gamezilla/@SHARED/core";
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

export type Model = {
  grid: FlowGrid.Model;
  draftTerminals: {
    [groupId in Flow.GroupId]?: DraftTerminal;
  };
};

type DraftTerminal = {
  groupId: Flow.GroupId;
  startId: Flow.NodeId;
  endId: Flow.NodeId | null;
};

export const init = (grid: FlowGrid.Model): Model => {
  return {
    draftTerminals: grid.flow.terminalsByGroupId,
    grid,
  };
};

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
    <div class="flex w-full flex-col gap-4 overflow-y-auto">
      <FlowGridUI.View
        model={model.grid}
        showCoordinates
        onDraggedOver={(nodeId) => dispatch({ t: "dragged-over", nodeId })}
        onPressDown={(nodeId) => dispatch({ t: "pressed-down-node", nodeId })}
        onPressUp={(nodeId) => dispatch({ t: "pressed-up", nodeId })}
      />
    </div>
  );
};
