import { APP_SOUND } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  ActionButton,
  Button,
  Drawer,
  DrawerHeader,
  IconArrowRotateLeft,
  IconArrowRotateRight,
  IconExpand,
  IconXMark,
  Slider,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { eq, memoize } from "gamezilla/@SHARED/core";
import { History } from "gamezilla/@SHARED/history";
import * as Flow from "../flow";
import * as FlowUI from "../flow-ui";
import * as FlowGrid from "./flow-grid";
import * as FlowGridUI from "./flow-grid-ui";

//
//
//
// Model
//
//
//

type Form = {
  terminalsByGroupId: DraftTerminals;
  width: number;
  height: number;
};

const toEmptyForm = ({ grid }: { grid: FlowGrid.Model }): Form => {
  return {
    terminalsByGroupId: {},
    height: grid.height,
    width: grid.width,
  };
};

export type Model = {
  form: History<Form>;
  opened: "dimensions" | null;
  widthInput: number;
  heightInput: number;
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
  const form: Form = {
    height: grid.height,
    width: grid.height,
    terminalsByGroupId: grid.flow.terminalsByGroupId,
  };
  return {
    form: History.init(form),
    heightInput: grid.height,
    widthInput: grid.width,
    opened: null,
  };
};

export const isUnsavedChanges = ({
  grid,
  model,
}: {
  grid: FlowGrid.Model;
  model: Model;
}): boolean => {
  const actual: Form = {
    terminalsByGroupId: grid.flow.terminalsByGroupId,
    height: grid.height,
    width: grid.width,
  };

  const draft: Form = History.present(model.form);

  return !eq(actual, draft);
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
  //
  | { t: "dimensions-form/clicked-open" }
  | { t: "dimensions-form/closed" }
  | { t: "dimensions-form/clicked-cancel" }
  | { t: "dimensions-form/clicked-save" }
  | { t: "dimensions-form/inputted-width"; width: number }
  | { t: "dimensions-form/inputted-height"; height: number };

export type Cmd = {
  t: "play-sound";
  sourceSrc: string;
};

export const update = ({
  grid,
  model,
  msg,
}: {
  grid: FlowGrid.Model;
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

    case "clicked-clear": {
      return {
        model: {
          ...model,
          form: History.push(model.form, toEmptyForm({ grid })),
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
      const currentPlacingGroupId = toCurrentPlacingGroupId(model);

      const draftTerminalsNew = updateDraftTerminalsOnPressedDownNode(
        History.present(model.form).terminalsByGroupId,
        currentPlacingGroupId,
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

    case "dimensions-form/inputted-height": {
      return { model: { ...model, heightInput: msg.height } };
    }

    case "dimensions-form/inputted-width": {
      return { model: { ...model, widthInput: msg.width } };
    }

    case "dimensions-form/clicked-save": {
      const formNew: Form = {
        ...History.present(model.form),
        width: model.widthInput,
        height: model.heightInput,
      };
      return {
        model: {
          ...model,
          form: History.push(model.form, formNew),
          opened: null,
        },
        cmd: {
          t: "play-sound",
          sourceSrc: APP_SOUND.refreshFeed,
        },
      };
    }

    case "dimensions-form/clicked-open": {
      return {
        model: resetDimensionsForm(grid, { ...model, opened: "dimensions" }),
      };
    }

    case "dimensions-form/closed": {
      return { model: resetDimensionsForm(grid, { ...model, opened: null }) };
    }

    case "dimensions-form/clicked-cancel": {
      return { model: resetDimensionsForm(grid, { ...model, opened: null }) };
    }
  }
};

const resetDimensionsForm = (grid: FlowGrid.Model, model: Model): Model => {
  return {
    ...model,
    widthInput: grid.width,
    heightInput: grid.height,
  };
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
const deriveCurrentGrid = ({ model }: { model: Model }): FlowGrid.Model => {
  const form = History.present(model.form);
  return FlowGrid.init({
    height: form.height,
    width: form.width,
    terminalsByGroupId: form.terminalsByGroupId,
  });
};

export const toCurrentGrid = memoize({
  func: deriveCurrentGrid,
  toKey(input) {
    return JSON.stringify(History.present(input.model.form));
  },
  cacheCapacity: 100,
});

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
        model={toCurrentGrid({ model })}
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
            onClick={() => dispatch({ t: "dimensions-form/clicked-open" })}
          />
        </div>
      </div>
      <Drawer
        open={model.opened === "dimensions"}
        onClose={() => dispatch({ t: "dimensions-form/closed" })}
        id="dimensions"
        position="bottom"
      >
        <DrawerHeader
          onClose={() => dispatch({ t: "dimensions-form/closed" })}
        />

        <div className="flex items-center justify-center gap-1 text-center text-5xl font-bold">
          <p>{`${model.widthInput}w`}</p>

          <IconXMark className="h-6 w-6" />

          <p>{`${model.heightInput}h`}</p>
        </div>

        <div className="flex flex-col gap-3 p-4 pb-8">
          <Slider
            onInput={(width) =>
              dispatch({ t: "dimensions-form/inputted-width", width })
            }
            value={model.widthInput}
            label="Width"
            min={3}
            max={15}
            step={1}
          />
          <Slider
            onInput={(height) =>
              dispatch({ t: "dimensions-form/inputted-height", height })
            }
            value={model.heightInput}
            label="Height"
            min={3}
            max={15}
            step={1}
          />
        </div>
        <div className="flex w-full items-center gap-4 p-4">
          <Button
            text="Cancel"
            className="flex-1"
            onClick={() => dispatch({ t: "dimensions-form/clicked-cancel" })}
          />
          <Button
            text="Save"
            className="flex-1"
            variant="contained"
            color="primary"
            onClick={() => dispatch({ t: "dimensions-form/clicked-save" })}
          />
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
