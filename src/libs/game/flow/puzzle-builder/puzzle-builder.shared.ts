import { UserId } from "@gamezilla/shared/app";
import { Err, Ok, Result } from "@gamezilla/core";
import { Flow } from "../flow";
import { FlowGrid, FlowGridPlayUI } from "../flow-grid";
import { bounds8x8 } from "../flow-grid/flow-grid-position";
import { PathId } from "../flow/flow";

//
//
// Model
//
//

export type SharedModel = EditModel | PlayModel;

type EditModel = {
  mode: "edit";
  focusedPathId: Flow.PathId;
  grid: FlowGrid.Model;
  draftTerminals: {
    [pathId in Flow.PathId]?: DraftTerminal;
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
//
//

export type DraftTerminal = {
  pathId: Flow.PathId;
  start: Flow.NodeId;
  end?: Flow.NodeId | null;
};

export const isDraftTerminalValid = (
  draftTerminal: DraftTerminal
): draftTerminal is Flow.Terminal => {
  return Boolean(draftTerminal.start && draftTerminal.end);
};

export const nodeIdToDraftTerminal = (
  model: SharedModel,
  nodeId: Flow.NodeId
): DraftTerminal | null => {
  if (model.mode !== "edit") {
    return null;
  }
  for (const pathId in model.draftTerminals) {
    if (!Flow.isPathId(pathId)) {
      continue;
    }
    const draftTerminal = model.draftTerminals[pathId];
    if (!draftTerminal) {
      continue;
    }
    if (draftTerminal.start === nodeId || draftTerminal.end === nodeId) {
      return draftTerminal;
    }
  }
  return null;
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
  | { t: "input-active-group"; pathId: PathId }
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

  if (msg.t === "input-mode") {
    const modelNew = initMode(msg.mode, model);

    return Ok(modelNew);
  }

  if (model.mode === "edit") {
    if (msg.t === "input-active-group") {
      const modelNew: SharedModel = {
        ...model,
        focusedPathId: msg.pathId,
      };
      return Ok(modelNew);
    }

    if (msg.t === "pressed-down-node") {
      const modelNew = updateEditModePressedDownNode({
        model,
        nodeId: msg.nodeId,
      });

      const focusedTerminal = model.draftTerminals[model.focusedPathId];
      if (focusedTerminal && isDraftTerminalValid(focusedTerminal)) {
        return Ok({
          ...modelNew,
          focusedPathId: toNextPathId(model.focusedPathId),
        });
      }

      return Ok(modelNew);
    }

    return Err("must-be-in-edit-mode");
  }

  if (model.mode === "play") {
    return Err("must-be-in-play-mode");
  }

  return Err("unimplemented");
};

//
//
//
// Edit Mode
//
//
//

const toNextPathId = (pathId: Flow.PathId): Flow.PathId => {
  const index = Flow.PATH_ID_ORDER.indexOf(pathId);
  const nextIndex = (index + 1) % Flow.PATH_ID_ORDER.length;
  const pathIdNew = Flow.PATH_ID_ORDER[nextIndex];

  if (!pathIdNew) {
    throw new Error("impossible condition");
  }

  return pathIdNew;
};

const updateEditModePressedDownNode = ({
  model,
  nodeId,
}: {
  model: EditModel;
  nodeId: Flow.NodeId;
}): EditModel => {
  const terminal = nodeIdToDraftTerminal(model, nodeId);

  if (!terminal) {
    return model;
  }

  if (terminal.pathId !== model.focusedPathId) {
    const draftTerminals: EditModel["draftTerminals"] = {
      ...model.draftTerminals,
      [terminal.pathId]: {
        ...terminal,
        // pair: terminal.pair.filter((x) => x !== nodeId),
      },
      // [model.focusedPathId]: {
      //   pathId: model.focusedPathId,
      //   pair: [...terminal.pair, nodeId].slice(0, 2),
      // },
    };

    return { ...model, draftTerminals };
  }

  return { ...model };
};

const initMode = (
  mode: ServerModel["mode"],
  model: SharedModel
): SharedModel => {
  if (mode === "edit") {
    return {
      grid: model.grid,
      mode: "edit",
      focusedPathId: Flow.PATH_ID_ORDER[0],
      draftTerminals: {},
    };
  }

  if (mode === "play") {
    return {
      mode: "play",
      ...FlowGridPlayUI.init(model.grid),
    };
  }

  return model;
};
