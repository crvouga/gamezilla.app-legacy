import { Cmd, Sub } from '@gamezilla/shared/core';
import { ServerModel, ServerMsg, ToBackend } from './flow.types';
import { RoomRequestCtx } from '@gamezilla/shared/backend';
import * as ModeBuilderBackend from './mode-builder/mode-builder.backend';

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
  msg: ToBackend;
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
  msg: ToBackend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t !== 'input-mode') {
    return { model };
  }

  if (msg.mode === 'mode-builder') {
    return { model: { t: 'mode-builder', c: ModeBuilderBackend.init } };
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
