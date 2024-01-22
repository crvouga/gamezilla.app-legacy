import {
  ActionButton,
  Drawer,
  DrawerHeader,
  IconArrowRotateLeft,
  IconArrowRotateRight,
  IconExpand,
  IconXMark,
  Slider,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { History } from "gamezilla/@SHARED/history";
import { FlowUI } from "..";
import * as Flow from "../flow";
import * as FlowGrid from "./flow-grid";
import * as FlowGridUI from "./flow-grid-ui";
import { APP_SOUND } from "gamezilla/@CHILD/app/@SHARED/client";

//
//
//
// Model
//
//
//

type Form = {
  width: number;
  height: number;
  terminalsByGroupId: DraftTerminals;
};

export const initForm: Form = {
  width: 5,
  height: 5,
  terminalsByGroupId: {},
};

export type Model = {
  grid: FlowGrid.Model;
  form: History<Form>;
  opened: "dimensions" | null;
};

type DraftTerminals = {
  [groupId in Flow.GroupId]?: DraftTerminal;
};

export const canClear = (model: Model): boolean => {
  return Object.keys(History.present(model.form).terminalsByGroupId).length > 0;
};

type DraftTerminal = {
  groupId: Flow.GroupId;
  startId: Flow.NodeId;
  endId?: Flow.NodeId | null;
};

export const init = ({ grid }: { grid: FlowGrid.Model }): Model => {
  return {
    form: History.init({
      height: grid.maxY,
      width: grid.maxY,
      terminalsByGroupId: grid.flow.terminalsByGroupId,
    }),
    grid,
    opened: null,
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
  | { t: "pressed-up-node"; nodeId: Flow.NodeId }
  | { t: "pressed-down-node"; nodeId: Flow.NodeId }
  | { t: "clicked-clear" }
  | { t: "clicked-undo" }
  | { t: "clicked-redo" }
  | { t: "clicked-dimensions" }
  | { t: "closed-dimensions" };

export type Cmd = {
  t: "play-sound";
  sourceSrc: string;
};

export const update = ({
  model,
  msg,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg.t) {
    case "dragged-over": {
      return { model };
    }

    case "pressed-up-node": {
      return { model };
    }

    case "clicked-dimensions": {
      return { model: { ...model, opened: "dimensions" } };
    }

    case "closed-dimensions": {
      return { model: { ...model, opened: null } };
    }

    case "clicked-clear": {
      return {
        model: {
          ...model,
          form: History.push(model.form, {
            ...initForm,
            width: History.present(model.form).width,
            height: History.present(model.form).height,
          }),
        },
        cmd: {
          t: "play-sound",
          sourceSrc: APP_SOUND.navTransitionLeft,
        },
      };
    }

    case "clicked-undo": {
      return {
        model: {
          ...model,
          form: History.undo(model.form),
        },
        cmd: {
          t: "play-sound",
          sourceSrc: APP_SOUND.navBackwardMin,
        },
      };
    }

    case "clicked-redo": {
      return {
        model: {
          ...model,
          form: History.redo(model.form),
        },
        cmd: {
          t: "play-sound",
          sourceSrc: APP_SOUND.navForwardMin,
        },
      };
    }

    case "pressed-down-node": {
      const currentPlacingGroupdId = toCurrentPlacingGroupId(model);
      const draftTerminalsNew = updateDraftTerminalsOnPressedDownNode(
        History.present(model.form).terminalsByGroupId,
        currentPlacingGroupdId,
        msg.nodeId
      );
      return {
        model: {
          ...model,
          form: History.push(model.form, {
            ...History.present(model.form),
            terminalsByGroupId: draftTerminalsNew,
          }),
        },
        cmd: {
          t: "play-sound",
          sourceSrc: APP_SOUND.tap,
        },
      };
    }
  }
};

export const updateDraftTerminalsOnPressedDownNode = (
  draftTerminals: DraftTerminals,
  currentPlacingGroupId: Flow.GroupId,
  pressedNodeId: Flow.NodeId
): DraftTerminals => {
  const pressedTerminal = findDraftTerminalByNodeId(
    draftTerminals,
    pressedNodeId
  );

  if (pressedTerminal) {
    if (pressedTerminal.startId === pressedNodeId) {
      if (!pressedTerminal.endId) {
        const draftTerminalsNew = { ...draftTerminals };
        delete draftTerminalsNew[pressedTerminal.groupId];
        return draftTerminalsNew;
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
    return draftTerminalsNew;
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
  draftTerminals: DraftTerminals,
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
    const draftTerminal = History.present(model.form).terminalsByGroupId[
      groupId
    ];

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
  draftTerminals: DraftTerminals
): Flow.Model["terminalsByGroupId"] => {
  const terminalsByGroupId: Flow.Model["terminalsByGroupId"] = {};

  for (const groupId in draftTerminals) {
    const draftTerminal = draftTerminals[groupId as Flow.GroupId];
    if (!draftTerminal) {
      continue;
    }
    if (!draftTerminal.endId) {
      continue;
    }
    const terminal: Flow.Terminal = {
      startId: draftTerminal.startId,
      endId: draftTerminal.endId,
      groupId: draftTerminal.groupId,
    };
    terminalsByGroupId[draftTerminal.groupId] = terminal;
  }
  return terminalsByGroupId;
};

export const toGrid = (model: Model): FlowGrid.Model => {
  return {
    ...model.grid,
    flow: {
      ...model.grid.flow,
      terminalsByGroupId: History.present(model.form).terminalsByGroupId,
    },
  };
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
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center overflow-y-auto">
      <div className="flex flex-1 flex-col justify-end">
        <div className="flex flex-col items-center justify-end">
          <div className="flex w-full items-center justify-center gap-1 pb-2">
            Placing
            <ViewTerminal
              groupId={toCurrentPlacingGroupId(model)}
              className="h-6 w-6"
            />
          </div>
        </div>
      </div>

      <FlowGridUI.View
        model={toGrid(model)}
        onDraggedOver={(nodeId) => dispatch({ t: "dragged-over", nodeId })}
        onPressDown={(nodeId) => dispatch({ t: "pressed-down-node", nodeId })}
        onPressUp={(nodeId) => dispatch({ t: "pressed-up-node", nodeId })}
      />

      <div className="flex w-full flex-1 flex-col justify-end">
        <div className="flex w-full items-center border-t border-neutral-700 py-0.5">
          <ActionButton
            icon={<IconArrowRotateLeft className="h-6 w-6" />}
            label="Undo"
            onClick={() => dispatch({ t: "clicked-undo" })}
            disabled={!History.canUndo(model.form)}
          />
          <ActionButton
            icon={<IconArrowRotateRight className="h-6 w-6" />}
            label="Redo"
            disabled={!History.canRedo(model.form)}
            onClick={() => dispatch({ t: "clicked-redo" })}
          />
          <ActionButton
            icon={<IconXMark className="h-6 w-6" />}
            label="Clear"
            disabled={!canClear(model)}
            onClick={() => dispatch({ t: "clicked-clear" })}
          />
          <ActionButton
            icon={<IconExpand className="h-6 w-6" />}
            label="Dimensions"
            onClick={() => dispatch({ t: "clicked-dimensions" })}
          />
        </div>
      </div>
      <Drawer
        open={model.opened === "dimensions"}
        onClose={() => dispatch({ t: "closed-dimensions" })}
        id="dimensions"
        position="bottom"
      >
        <DrawerHeader onClose={() => dispatch({ t: "closed-dimensions" })} />

        <div className="flex items-center justify-center gap-1 text-center text-4xl font-bold">
          <p>{`${History.present(model.form).width}w`}</p>
          <IconXMark className="h-6 w-6" />
          <p>{`${History.present(model.form).height}h`}</p>
        </div>

        <div className="flex flex-col gap-3 p-4 pb-8">
          <Slider label="Width" min={3} max={15} step={1} />
          <Slider label="Height" min={3} max={15} step={1} />
        </div>
      </Drawer>
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
