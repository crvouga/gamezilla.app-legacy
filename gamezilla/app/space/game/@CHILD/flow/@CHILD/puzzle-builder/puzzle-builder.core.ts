import { err, ok, Result } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import {
  Flow,
  FlowGrid,
  FlowGridPosition,
  FlowGridUIPlay,
} from "../../@SHARED/flow";
import { SpaceCtx } from "gamezilla/app/space/@SHARED";

/**
 * Just like a Terminal but invalid
 */
type DraftTerminal = {
  groupId: Flow.GroupId;
  startId: Flow.NodeId;
  endId: Flow.NodeId | null;
};

//
//
// Model
//
//

export type CoreModel = {
  mode: "edit" | "play";
  activeGroupId: Flow.GroupId;
  playUI: FlowGridUIPlay.Model;
  editUI: FlowGrid.Model;
  draftTerminals: {
    [groupId in Flow.GroupId]?: DraftTerminal;
  };
};

export type ClientModel = CoreModel;

export type ServerModel = CoreModel;

const emptyGrid = FlowGrid.init({ bounds: FlowGridPosition.bounds8x8 });

export const initCore: CoreModel = {
  playUI: FlowGridUIPlay.init(emptyGrid),
  editUI: emptyGrid,
  draftTerminals: {},
  activeGroupId: Flow.PATH_ID_ORDER[0],
  mode: "play",
};

//
//
// Msg
//
//

export type ClientMsg = Req | { t: "play-ui"; c: FlowGridUIPlay.Msg };

export type ServerMsg = { t: "none" };

export type ToServer = Req;

export type ToClient = Res;

export type Req =
  | { t: "input-active-group"; groupId: Flow.GroupId }
  | { t: "input-mode"; mode: ServerModel["mode"] }
  | { t: "pressed-down-node"; nodeId: Flow.NodeId };

export type Res = Req & {
  result: Result<string, CoreModel>;
};

export const updateCore = ({
  msg,
  ctx,
  model,
}: {
  ctx: SpaceCtx & { currentUserId: UserId };
  msg: Req;
  model: CoreModel;
}): Result<string, CoreModel> => {
  if (ctx.currentUserId !== ctx.space.hostId) {
    return err("must-be-host");
  }

  const updated = updateCoreModel({ msg, model });

  return ok(updated);
};

export const updateCoreModel = ({
  msg,
  model,
}: {
  msg: Req;
  model: CoreModel;
}): CoreModel => {
  switch (model.mode) {
    case "edit": {
      if (msg.t === "pressed-down-node") {
        const pressedTerminal = findDraftTerminalByNodeId(model, msg.nodeId);

        if (pressedTerminal) {
          if (pressedTerminal.groupId === model.activeGroupId) {
            return removeNodeFromDraftTerminal(model, msg.nodeId);
          }

          return { ...model, activeGroupId: pressedTerminal.groupId };
        }

        const activeTerminal = model.draftTerminals[model.activeGroupId];

        if (!activeTerminal) {
          const terminalNew: DraftTerminal = {
            groupId: model.activeGroupId,
            startId: msg.nodeId,
            endId: null,
          };

          return addDraftTerminal(model, terminalNew);
        }

        const terminalNew: DraftTerminal = {
          ...activeTerminal,
          endId: msg.nodeId,
        };
        const modelNew = addDraftTerminal(
          {
            ...model,
            activeGroupId: toNextGroupId(model.activeGroupId),
          },
          terminalNew
        );
        return modelNew;
      }

      if (msg.t === "input-mode") {
        if (msg.mode === "play") {
          return {
            ...model,
            playUI: {
              ...model.playUI,
            },
            mode: "play",
          };
        }

        return model;
      }

      return model;
    }

    case "play": {
      if (msg.t === "input-mode")
        if (msg.mode === "edit") {
          return {
            ...model,
            mode: "edit",
            activeGroupId: Flow.PATH_ID_ORDER[0],
          };
        }

      return model;
    }
  }
};

/**
 * Finds all the valid terminals in the draft terminals.
 */
export const findValidDraftTerminals = (model: CoreModel) => {
  let terminals: { [groupId in Flow.GroupId]?: Flow.Terminal } = {};

  for (const draft of yieldDraftTerminals(model)) {
    if (!draft.endId) {
      continue;
    }

    const terminalNew: Flow.Terminal = {
      groupId: draft.groupId,
      startId: draft.startId,
      endId: draft.endId,
    };

    terminals = {
      ...terminals,
      [draft.groupId]: terminalNew,
    };
  }

  return terminals;
};

/**
 *
 */
export const yieldDraftTerminals = function* (
  model: CoreModel
): Generator<DraftTerminal> {
  for (const groupId in model.draftTerminals) {
    if (!Flow.isGroupId(groupId)) {
      continue;
    }
    const draftTerminal = model.draftTerminals[groupId];
    if (!draftTerminal) {
      continue;
    }
    yield draftTerminal;
  }
};

/**
 *
 */
export const findDraftTerminalByNodeId = (
  model: CoreModel,
  nodeId: Flow.NodeId
): DraftTerminal | null => {
  if (model.mode !== "edit") {
    return null;
  }
  for (const groupId in model.draftTerminals) {
    if (!Flow.isGroupId(groupId)) {
      continue;
    }
    const draftTerminal = model.draftTerminals[groupId];
    if (!draftTerminal) {
      continue;
    }
    if (draftTerminal.startId === nodeId || draftTerminal.endId === nodeId) {
      return draftTerminal;
    }
  }
  return null;
};

/**
 * Removes a single dot from the UI
 */
export const removeNodeFromDraftTerminal = (
  model: CoreModel,
  nodeId: Flow.NodeId
): CoreModel => {
  const terminal = findDraftTerminalByNodeId(model, nodeId);

  if (!terminal) {
    return model;
  }

  if (nodeId === terminal.startId) {
    if (!terminal.endId) {
      return removeDraftTerminal(model, terminal.groupId);
    }

    return addDraftTerminal(model, {
      ...terminal,
      startId: terminal.endId,
      endId: null,
    });
  }

  if (nodeId === terminal.endId) {
    return addDraftTerminal(model, {
      ...terminal,
      endId: null,
    });
  }

  return model;
};

const removeDraftTerminal = (
  model: CoreModel,
  groupId: Flow.GroupId
): CoreModel => {
  const draftTerminalsNew = { ...model.draftTerminals };
  delete draftTerminalsNew[groupId];
  return {
    ...model,
    draftTerminals: draftTerminalsNew,
  };
};

const addDraftTerminal = (
  model: CoreModel,
  terminal: DraftTerminal
): CoreModel => {
  return {
    ...model,
    draftTerminals: {
      ...model.draftTerminals,
      [terminal.groupId]: terminal,
    },
  };
};

//
//
//
// Edit Mode
//
//
//

const toNextGroupId = (groupId: Flow.GroupId): Flow.GroupId => {
  const index = Flow.PATH_ID_ORDER.indexOf(groupId);
  const nextIndex = (index + 1) % Flow.PATH_ID_ORDER.length;
  const groupIdNew = Flow.PATH_ID_ORDER[nextIndex];

  if (!groupIdNew) {
    throw new Error("impossible condition");
  }

  return groupIdNew;
};
