import { UserId } from '@gamezilla/shared/app';
import { Browser, Err, Ok, Result } from '@gamezilla/shared/core';
import { Flow } from '../flow';
import { FlowGrid, FlowGridUI } from '../flow-grid';
import { bounds8x8 } from '../flow-grid/flow-grid-position';
import { GroupId } from '../flow/flow';

//
//
// Model
//
//

export type SharedModel =
  | {
      mode: 'edit-groups';
      focusedGroupId: Flow.GroupId;
      grid: FlowGrid.Model;
    }
  | {
      mode: 'play';
      grid: FlowGrid.Model;
    };

export type ClientModel = SharedModel & FlowGridUI.Model;

export type ServerModel = SharedModel;

export const initShared: SharedModel = {
  mode: 'play',
  grid: FlowGrid.initEmpty({ bounds: bounds8x8 }),
};

//
//
// Msg
//
//

export type ClientMsg =
  | FlowGridUI.Msg
  | Req
  | { t: 'scroll-done'; result: Browser.ScrollResult };

export type ServerMsg = { t: 'none' };

export type ToServer = Req;

export type ToClient = Res;

export type Req =
  | { t: 'input-active-group'; groupId: GroupId }
  | { t: 'input-mode'; mode: ServerModel['mode'] };

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
  if (msg.t === 'input-active-group') {
    if (ctx.currentUserId !== ctx.hostId) {
      return Err('must-be-host');
    }

    if (model.mode !== 'edit-groups') {
      return Err('must-be-in-edit-groups-mode');
    }

    const modelNew: SharedModel = {
      ...model,
      focusedGroupId: msg.groupId,
    };
    return Ok(modelNew);
  }

  if (msg.t === 'input-mode') {
    if (ctx.currentUserId !== ctx.hostId) {
      return Err('must-be-host');
    }

    const modelNew = initMode(msg.mode, model);

    return Ok(modelNew);
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
      grid: model.grid,
    };
  }

  return model;
};
