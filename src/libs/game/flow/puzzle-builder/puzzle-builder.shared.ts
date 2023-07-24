import { Err, Ok, Result } from "@gamezilla/core";
import { UserId } from "@gamezilla/shared/app";
import { Flow } from "../flow";
import { FlowGrid, FlowGridPlayUI } from "../flow-grid";
import { bounds8x8 } from "../flow-grid/flow-grid-position";
import { PathId } from "../flow/flow";

type DraftTerminal = {
  pathId: PathId;
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
  activePathId: Flow.PathId;
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

export const findDraftPathTerminal = (
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
    if (draftTerminal.startId === nodeId || draftTerminal.endId === nodeId) {
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

  if (model.mode === "edit") {
    if (msg.t === "pressed-down-node") {
      const pressedTerminal = findDraftPathTerminal(model, msg.nodeId);

      if (pressedTerminal) {
        return Ok(model);
      }

      const activeTerminal = model.draftTerminals[model.activePathId];

      if (!activeTerminal) {
        const terminalNew: DraftTerminal = {
          pathId: model.activePathId,
          startId: msg.nodeId,
          endId: null,
        };
        const modelNew: EditModel = {
          ...model,
          draftTerminals: {
            ...model.draftTerminals,
            [model.activePathId]: terminalNew,
          },
        };
        return Ok(modelNew);
      }

      const terminalNew: DraftTerminal = {
        ...activeTerminal,
        endId: msg.nodeId,
      };
      const modelNew: EditModel = {
        ...model,
        draftTerminals: {
          ...model.draftTerminals,
          [model.activePathId]: terminalNew,
        },
        activePathId: toNextPathId(model.activePathId),
      };
      return Ok(modelNew);
    }

    if (msg.t === "input-mode") {
      if (msg.mode === "play") {
        return Ok({
          ...model,
          model: "play",
        });
      }
    }

    return Err("must-be-in-edit-mode");
  }

  if (model.mode === "play") {
    if (msg.t === "input-mode")
      if (msg.mode === "edit") {
        return Ok({
          grid: model.grid,
          mode: "edit",
          activePathId: Flow.PATH_ID_ORDER[0],
          draftTerminals: {},
        });
      }

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
