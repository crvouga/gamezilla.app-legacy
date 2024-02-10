import {
  AnonymousClientCtx,
  ClientCmd,
  ClientEvent,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { VDom } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import { EventMeta, WithEventId } from "../@SHARED/event";
import { SpaceEvent } from "../spaces-core";
import {
  ModelClient,
  MsgClient,
  MsgToClient,
  MsgToServer,
} from "../spaces.core";

export type Input = {
  ctx: AnonymousClientCtx;
  model: ModelClient;
  msg?: MsgClient | null;
  msgServer?: MsgToClient | null;
  msgEvt?: ClientEvent | null;
  msgCmd?: null;
  msgSpaceEvent?: (SpaceEvent & EventMeta) | null;
};

export type Output = {
  model: ModelClient;
  eff?: Eff<MsgClient>;
  msgCmd?: ClientCmd<{
    MsgClient: MsgClient;
    MsgToServer: MsgToServer;
  }>[];
  msgEvt?: [];
  msgSpaceEvent?: WithEventId<SpaceEvent>[];
};

export type SpaceClientModule = {
  update: (input: Input) => Output;
  subscriptions: (input: {
    ctx: AnonymousClientCtx;
    model: ModelClient;
  }) => Sub<MsgClient>;
  View: (input: {
    ctx: AnonymousClientCtx;
    model: ModelClient;
    dispatch: (msg: MsgClient) => void;
  }) => VDom;
};

const chainUpdates = (
  acc: Output,
  ...updates: ((model: ModelClient) => Output)[]
): Output => {
  const [update, ...rest] = updates;

  if (!update) {
    return acc;
  }

  const updated = update(acc.model);

  const accNew: Output = {
    model: updated.model,
    eff: Eff.batch([acc.eff, updated.eff]),
    msgCmd: [...(acc.msgCmd ?? []), ...(updated.msgCmd ?? [])],
    msgEvt: [...(acc.msgEvt ?? []), ...(updated.msgEvt ?? [])],
    msgSpaceEvent: [
      ...(acc.msgSpaceEvent ?? []),
      ...(updated.msgSpaceEvent ?? []),
    ],
  };

  return chainUpdates(accNew, ...rest);
};

export const SpaceClientModule = {
  chainUpdates,
};
