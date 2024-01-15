import { ActionButton, IconArrowCircle, IconArrowRotateLeft, IconXMark } from "gamezilla/@CHILD/app/@SHARED/ui";
import { FlowUI } from "..";
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
  draftTerminalsByGroupId: {
    [groupId in Flow.GroupId]?: DraftTerminal;
  };
};

type DraftTerminal = {
  groupId: Flow.GroupId;
  startId: Flow.NodeId;
  endId?: Flow.NodeId | null;
};

export const init = ({ grid }: { grid: FlowGrid.Model }): Model => {
  return {
    draftTerminalsByGroupId: grid.flow.terminalsByGroupId,
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
  | { t: "mouse-leave" }
  | { t: "clicked-clear" }
  | { t: "clicked-undo" }
  | { t: "clicked-redo" }

export const update = ({
  model,
  msg,
}: {
  msg: Msg;
  model: Model;
}): Model => {
  switch (msg.t) {
    case "dragged-over": {
      return model;
    }

    case "mouse-leave": {
      return model;
    }

    case "pressed-up": {
      return model;
    }

    case 'clicked-clear': {
      return {
        ...model,
        draftTerminalsByGroupId: {}
      }
    }

    case 'clicked-undo': {
      return {
        ...model,

      }
    }

    case 'clicked-redo': {
      return {
        ...model,
      }
    }

    case "pressed-down-node": {
      const currentPlacingGroupdId = toCurrentPlacingGroupId(model);
      const draftTerminalsNew = updateDraftTerminalsOnPressedDownNode(
        model.draftTerminalsByGroupId,
        currentPlacingGroupdId,
        msg.nodeId
      );
      return { ...model, draftTerminalsByGroupId: draftTerminalsNew };
    }
  }
};

export const updateDraftTerminalsOnPressedDownNode = (
  draftTerminals: Model["draftTerminalsByGroupId"],
  currentPlacingGroupId: Flow.GroupId,
  pressedNodeId: Flow.NodeId
): Model["draftTerminalsByGroupId"] => {
  const pressedTerminal = findDraftTerminalByNodeId(
    draftTerminals,
    pressedNodeId
  );

  if (pressedTerminal) {
    if (pressedTerminal.startId === pressedNodeId) {
      if (!pressedTerminal.endId) {
        const draftTerminalsNew = { ...draftTerminals };
        delete draftTerminalsNew[pressedTerminal.groupId];
        return draftTerminalsNew
      }
      const terminalNew: DraftTerminal = {
        groupId: pressedTerminal.groupId,
        startId: pressedTerminal.endId,
        endId: null,
      };
      return {
        ...draftTerminals,
        [pressedTerminal.groupId]: terminalNew,
      };
    }
    const terminalNew: DraftTerminal = {
      groupId: pressedTerminal.groupId,
      startId: pressedTerminal.startId,
      endId: null,
    };
    const draftTerminalsNew = {
      ...draftTerminals,
      [pressedTerminal.groupId]: terminalNew,
    };
    return draftTerminalsNew
  }

  const currentTerminal = draftTerminals[currentPlacingGroupId];

  if (!currentTerminal) {
    const terminalNew: DraftTerminal = {
      groupId: currentPlacingGroupId,
      startId: pressedNodeId,
      endId: null,
    };

    return {
      ...draftTerminals,
      [currentPlacingGroupId]: terminalNew,
    };
  }

  if (currentTerminal.groupId !== currentPlacingGroupId) {
    return draftTerminals;
  }

  if (currentTerminal.startId === pressedNodeId) {
    return draftTerminals;
  }

  const terminalNew: DraftTerminal = {
    groupId: currentPlacingGroupId,
    startId: currentTerminal.startId,
    endId: pressedNodeId,
  };

  return {
    ...draftTerminals,
    [currentPlacingGroupId]: terminalNew,
  };
};

const findDraftTerminalByNodeId = (
  draftTerminals: Model["draftTerminalsByGroupId"],
  nodeId: Flow.NodeId
): DraftTerminal | null => {
  for (const groupId in draftTerminals) {
    const draftTerminal = draftTerminals[groupId as Flow.GroupId];

    if (draftTerminal?.startId === nodeId) {
      return draftTerminal;
    }

    if (draftTerminal?.endId === nodeId) {
      return draftTerminal;
    }
  }
  return null;
};

export const toCurrentPlacingGroupId = (model: Model): Flow.GroupId => {
  for (const groupId of Flow.GROUP_ID_ORDER) {
    const draftTerminal = model.draftTerminalsByGroupId[groupId];

    if (!draftTerminal) {
      return groupId;
    }

    if (!draftTerminal.endId) {
      return groupId;
    }
  }

  return Flow.GROUP_ID_ORDER[Flow.GROUP_ID_ORDER.length - 1]!;
};


export const filterDraftTerminals = (
  draftTerminals: Model["draftTerminalsByGroupId"]
): Flow.Model['terminalsByGroupId'] => {
  const terminalsByGroupId: Flow.Model['terminalsByGroupId'] = {};

  for (const groupId in draftTerminals) {
    const draftTerminal = draftTerminals[groupId as Flow.GroupId];
    if (!draftTerminal) {
      continue
    }
    if (!draftTerminal.endId) {
      continue
    }
    const terminal: Flow.Terminal = {
      startId: draftTerminal.startId,
      endId: draftTerminal.endId,
      groupId: draftTerminal.groupId,
    }
    terminalsByGroupId[draftTerminal.groupId] = terminal
  }
  return terminalsByGroupId;
}

export const toGrid = (
  model: Model
): FlowGrid.Model => {
  return {
    ...model.grid,
    flow: {
      ...model.grid.flow,
      terminalsByGroupId: model.draftTerminalsByGroupId,
    }
  }
}

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
    <div className="flex w-full flex-col gap-4 overflow-y-auto">

      <div className="flex flex-1 flex-col items-center justify-end">
        <div className="flex w-full items-center justify-center gap-1 pb-2">
          Placing
          <ViewTerminal
            groupId={toCurrentPlacingGroupId(model)}
            className="h-6 w-6"
          />
        </div>
      </div>

      <FlowGridUI.View
        model={toGrid(model)}
        onDraggedOver={(nodeId) => dispatch({ t: "dragged-over", nodeId })}
        onPressDown={(nodeId) => dispatch({ t: "pressed-down-node", nodeId })}
        onPressUp={(nodeId) => dispatch({ t: "pressed-up", nodeId })}
      />

      <div className="w-full flex items-center">
        <ActionButton
          icon={<IconArrowRotateLeft className="w-6 h-6" />}
          label="Back"
          onClick={() => dispatch({ t: 'clicked-undo' })}
        />
        <ActionButton
          icon={<IconArrowRotateLeft className="w-6 h-6" />}
          label="Forward"
          onClick={() => dispatch({ t: 'clicked-redo' })}
        />
        <ActionButton
          icon={<IconXMark className="w-6 h-6" />}
          label="Clear"
          onClick={() => dispatch({ t: 'clicked-clear' })}
        />
      </div>
    </div>
  );
};

const ViewTerminal = ({
  groupId,
  className,
}: {
  className: string;
  groupId: Flow.GroupId;
}) => {
  const color = FlowUI.Color.groupIdToHex(groupId);
  return (
    <svg className={className} viewBox="-1 -1 2 2">
      <circle cx="0" cy="0" r="0.8" fill={color} />
    </svg>
  );
};