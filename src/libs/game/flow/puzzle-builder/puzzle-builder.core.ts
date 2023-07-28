import { Err, Ok, Result } from "@gamezilla/core";
import { UserId } from "@gamezilla/shared/app";
import { Flow } from "../flow";
import { FlowGrid, FlowGridPlayUI } from "../flow-grid";
import { bounds8x8 } from "../flow-grid/flow-grid-position";
import { GroupId } from "../flow/flow";

type DraftTerminal = {
  groupId: GroupId;
  startId: Flow.NodeId;
  endId: Flow.NodeId | null;
};

//
//
// Model
//
//

export type SharedModel = EditModel | PlayModel;

type EditModel = {
  mode: "edit";
  activeGroupId: Flow.GroupId;
  grid: FlowGrid.Model;
  draftTerminals: {
    [groupId in Flow.GroupId]?: DraftTerminal;
  };
};

type PlayModel = FlowGridPlayUI.Model & {
  mode: "play";
};

export type ClientModel = SharedModel;

export type ServerModel = SharedModel;

const emptyGrid = FlowGrid.initEmpty({ bounds: bounds8x8 });
export const initShared: SharedModel = {
  ...FlowGridPlayUI.init(emptyGrid),
  mode: "play",
};

//
//
// Msg
//
//

export type ClientMsg = Req;

export type ServerMsg = { t: "none" };

export type ToServer = Req;

export type ToClient = Res;

export type Req =
  | { t: "input-active-group"; groupId: GroupId }
  | { t: "input-mode"; mode: ServerModel["mode"] }
  | { t: "pressed-down-node"; nodeId: Flow.NodeId };

export type Res = Req & {
  result: Result<string, SharedModel>;
};

export const handle = ({
  msg,
  ctx,
  model,
}: {
  ctx: { hostId: UserId; currentUserId: UserId };
  msg: Req;
  model: SharedModel;
}): Result<string, SharedModel> => {
  if (ctx.currentUserId !== ctx.hostId) {
    return Err("must-be-host");
  }

  const updated = updateModel({ msg, model });

  return Ok(updated);
};

export const updateModel = ({
  msg,
  model,
}: {
  msg: Req;
  model: SharedModel;
}): SharedModel => {
  if (model.mode === "edit") {
    if (msg.t === "pressed-down-node") {
      const pressedTerminal = findDraftTerminal(model, msg.nodeId);

      if (pressedTerminal) {
        return { ...model, activeGroupId: pressedTerminal.groupId };
      }

      const activeTerminal = model.draftTerminals[model.activeGroupId];

      if (!activeTerminal) {
        const terminalNew: DraftTerminal = {
          groupId: model.activeGroupId,
          startId: msg.nodeId,
          endId: null,
        };

        const modelNew: EditModel = {
          ...model,
          draftTerminals: {
            ...model.draftTerminals,
            [model.activeGroupId]: terminalNew,
          },
        };
        return modelNew;
      }

      if (activeTerminal.groupId === model.activeGroupId) {
        return model;
      }

      const terminalNew: DraftTerminal = {
        ...activeTerminal,
        endId: msg.nodeId,
      };
      const modelNew: EditModel = {
        ...model,
        draftTerminals: {
          ...model.draftTerminals,
          [model.activeGroupId]: terminalNew,
        },
        activeGroupId: toNextGroupId(model.activeGroupId),
      };
      return modelNew;
    }

    if (msg.t === "input-mode") {
      if (msg.mode === "play") {
        return model;
      }
      return model;
    }

    return model;
  }

  if (model.mode === "play") {
    if (msg.t === "input-mode")
      if (msg.mode === "edit") {
        return {
          grid: model.grid,
          mode: "edit",
          activeGroupId: Flow.PATH_ID_ORDER[0],
          draftTerminals: {},
        };
      }

    return model;
  }
  return model;
};

/**
 *
 */
export const findDraftTerminal = (
  model: SharedModel,
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
