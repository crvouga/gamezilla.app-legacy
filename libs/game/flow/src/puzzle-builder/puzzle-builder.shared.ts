import { UserId } from '@gamezilla/shared/app';
import { Browser, Err, Ok, Result } from '@gamezilla/shared/core';
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
  mode: 'edit-groups';
  focusedGroupId: Flow.GroupId;
  grid: FlowGrid.Model;
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
// Msg
//
//

export type ClientMsg =
  | Req
  | { t: 'pressed-down-node'; nodeId: Flow.NodeId }
  | { t: 'scroll-done'; result: Browser.ScrollResult };

export type ServerMsg = { t: 'none' };

export type ToServer = Req;

export type ToClient = Res;

export type Req =
  | { t: 'input-active-group'; groupId: GroupId }
  | { t: 'input-mode'; mode: ServerModel['mode'] }
  | { t: 'toggle-terminal-node'; nodeId: Flow.NodeId; groupId: GroupId };

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

  if (model.mode === 'edit-groups') {
    if (msg.t === 'input-active-group') {
      const modelNew: SharedModel = {
        ...model,
        focusedGroupId: msg.groupId,
      };
      return Ok(modelNew);
    }

    return Err('must-be-in-edit-mode');
  }

  if (model.mode === 'play') {
    if (msg.t === 'toggle-terminal-node') {
      const modelNew: SharedModel = { ...model };

      return Ok(modelNew);
    }

    return Err('must-be-in-play-mode');
  }

  return Err('unimplemented');
};

const initMode = (
  mode: ServerModel['mode'],
  model: SharedModel
): SharedModel => {
  if (mode === 'edit-groups') {
    return {
      grid: model.grid,
      mode: 'edit-groups',
      focusedGroupId: Flow.groupIdOrder[0],
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
