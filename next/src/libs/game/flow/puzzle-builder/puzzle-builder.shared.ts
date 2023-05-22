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

export const isDraftTerminalValid = (
  draftTerminal: DraftTerminal
): draftTerminal is Flow.Terminal => {
  return draftTerminal.pair.length === 2;
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
      const modelNew = updateEditModePressedDownNode({
        model,
        nodeId: msg.nodeId,
      });

      const focusedTerminal = model.draftTerminals[model.focusedGroupId];
      if (focusedTerminal && isDraftTerminalValid(focusedTerminal)) {
        return Ok({
          ...modelNew,
          focusedGroupId: toNextGroupId(model.focusedGroupId),
        });
      }

      return Ok(modelNew);
    }

    return Err('must-be-in-edit-mode');
  }

  if (model.mode === 'play') {
    return Err('must-be-in-play-mode');
  }

  return Err('unimplemented');
};

//
//
//
// Edit Mode
//
//
//

const toNextGroupId = (groupId: Flow.GroupId): Flow.GroupId => {
  const index = Flow.groupIdOrder.indexOf(groupId);
  const nextIndex = (index + 1) % Flow.groupIdOrder.length;
  const groupIdNew = Flow.groupIdOrder[nextIndex];

  if (!groupIdNew) {
    throw new Error('impossible condition');
  }

  return groupIdNew;
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
    const existing = model.draftTerminals[model.focusedGroupId];
    const draftTerminals: EditModel['draftTerminals'] = {
      ...model.draftTerminals,
      [model.focusedGroupId]: {
        groupId: model.focusedGroupId,
        pair: existing ? [nodeId, ...existing.pair].slice(0, 2) : [nodeId],
      },
    };

    return { ...model, draftTerminals };
  }

  if (terminal.groupId !== model.focusedGroupId) {
    const draftTerminals: EditModel['draftTerminals'] = {
      ...model.draftTerminals,
      [terminal.groupId]: {
        ...terminal,
        pair: terminal.pair.filter((x) => x !== nodeId),
      },
      // [model.focusedGroupId]: {
      //   groupId: model.focusedGroupId,
      //   pair: [...terminal.pair, nodeId].slice(0, 2),
      // },
    };

    return { ...model, draftTerminals };
  }

  return { ...model };
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
