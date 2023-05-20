import { UserId } from '@gamezilla/shared/app';
import { Browser, Err, Ok, Result } from '@gamezilla/shared/core';
import { Flow } from '../flow';
import { FlowGrid, FlowGridUI } from '../flow-grid';
import { bounds8x8 } from '../flow-grid/flow-grid-position';
import { GroupId, groupIdOrder } from '../flow/flow';

//
//
// Model
//
//

export type SharedModel = {
  mode: 'edit-groups';
  focusedGroupId: Flow.GroupId;
  grid: FlowGrid.Model;
};

export type ClientModel = SharedModel & FlowGridUI.Model;

export type ServerModel = SharedModel;

export const initShared: SharedModel = {
  mode: 'edit-groups',
  focusedGroupId: groupIdOrder[0],
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

export type Req = { t: 'inputted-active-group'; groupId: GroupId };

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

  if (msg.t === 'inputted-active-group') {
    const modelNew: SharedModel = {
      ...model,
      focusedGroupId: msg.groupId,
    };
    return Ok(modelNew);
  }

  return Err("can't-handle");
};
