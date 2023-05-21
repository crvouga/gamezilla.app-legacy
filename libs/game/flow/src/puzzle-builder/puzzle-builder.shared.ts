import { UserId } from '@gamezilla/shared/app';
import { Err, Ok, Result } from '@gamezilla/shared/core';
import { Flow } from '../flow';
import { FlowGrid, FlowGridPlayUI } from '../flow-grid';
import { bounds8x8 } from '../flow-grid/flow-grid-position';
import { GroupId } from '../flow/flow';

//
//
// Model
//
//

export type SharedModel = EditModel | PlayModel;

type EditModel = {
  mode: 'edit';
  focusedGroupId: Flow.GroupId;
  grid: FlowGrid.Model;
  draftTerminals: {
    [groupId in Flow.GroupId]?: DraftTerminal;
  };
};

type PlayModel = FlowGridPlayUI.Model & {
  mode: 'play';
};

export type ClientModel = SharedModel;

export type ServerModel = SharedModel;

const emptyGrid = FlowGrid.initEmpty({ bounds: bounds8x8 });
export const initShared: SharedModel = {
  ...FlowGridPlayUI.init(emptyGrid),
  mode: 'play',
};

//
//
//
//

export type DraftTerminal = {
  groupId: Flow.GroupId;
  pair: [Flow.NodeId] | [Flow.NodeId, Flow.NodeId];
};

export const nodeIdToDraftTerminal = (
  model: SharedModel,
  nodeId: Flow.NodeId
): DraftTerminal | null => {
  if (model.mode !== 'edit') {
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
    if (draftTerminal.pair.includes(nodeId)) {
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

export type ServerMsg = { t: 'none' };

export type ToServer = Req;

export type ToClient = Res;

export type Req =
  | { t: 'input-active-group'; groupId: GroupId }
  | { t: 'input-mode'; mode: ServerModel['mode'] }
  | { t: 'pressed-down-node'; nodeId: Flow.NodeId };

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
    return Err('must-be-host');
  }

  if (msg.t === 'input-mode') {
    const modelNew = initMode(msg.mode, model);

    return Ok(modelNew);
  }

  if (model.mode === 'edit') {
    if (msg.t === 'input-active-group') {
      const modelNew: SharedModel = {
        ...model,
        focusedGroupId: msg.groupId,
      };
      return Ok(modelNew);
    }

    if (msg.t === 'pressed-down-node') {
      const terminal = nodeIdToDraftTerminal(model, msg.nodeId);

      if (!terminal) {
        const modelNew: SharedModel = {
          ...model,
          draftTerminals: {
            ...model.draftTerminals,
            [model.focusedGroupId]: {
              groupId: model.focusedGroupId,
              pair: [msg.nodeId],
            },
          },
        };
        return Ok(modelNew);
      }

      return Ok({ ...model });
    }

    return Err('must-be-in-edit-mode');
  }

  if (model.mode === 'play') {
    return Err('must-be-in-play-mode');
  }

  return Err('unimplemented');
};

const initMode = (
  mode: ServerModel['mode'],
  model: SharedModel
): SharedModel => {
  if (mode === 'edit') {
    return {
      grid: model.grid,
      mode: 'edit',
      focusedGroupId: Flow.groupIdOrder[0],
      draftTerminals: {},
    };
  }

  if (mode === 'play') {
    return {
      mode: 'play',
      ...FlowGridPlayUI.init(model.grid),
    };
  }

  return model;
};
