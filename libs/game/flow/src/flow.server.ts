import { Cmd, Sub } from '@gamezilla/shared/core';
import { ServerModel, ServerMsg, ToServer } from './flow.shared';
import { RoomRequestCtx } from '@gamezilla/shared/server';
import * as ModeBuilderServer from './mode-builder/mode-builder.server';

type Model = ServerModel;

export const init: Model = {
  t: 'none',
};

type Msg = ServerMsg;

export const update = ({
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return { model };
};

export const updateFromClient = ({
  msg,
  model,
  ctx,
}: {
  ctx: RoomRequestCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-mode') {
    return updateInputMode({ msg, ctx, model });
  }

  return { model };
};

const updateInputMode = ({
  msg,
  model,
  ctx,
}: {
  ctx: RoomRequestCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t !== 'input-mode') {
    return { model };
  }

  if (msg.mode === 'mode-builder') {
    return { model: { t: 'mode-builder', c: ModeBuilderServer.init } };
  }

  if (msg.mode === 'none') {
    return { model: { t: 'none' } };
  }

  if (ctx.hostId === ctx.currentUserId) {
    if (msg.mode === 'mode-builder') {
      return { model };
    }
  }
  return { model };
};

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
