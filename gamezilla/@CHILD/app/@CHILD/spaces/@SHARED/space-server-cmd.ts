import { ServerCmd } from "gamezilla/@CHILD/app/@SHARED/server";

//
//
//
//
//
//
//

export type SpaceServerCmd<MsgToClient> =
  | ServerCmd<MsgToClient>
  | { t: "send-to-space"; msg: MsgToClient };

//
//
//
//
//
//
//
//

export const sendToSpace = <MsgToClient>(
  msg: MsgToClient
): SpaceServerCmd<MsgToClient> => {
  return { t: "send-to-space", msg };
};

//
//
//
//
//
//
//

const mapOne = <A, B>(
  fn: (a: A) => B,
  msgCmd: SpaceServerCmd<A>
): SpaceServerCmd<B> => {
  switch (msgCmd.t) {
    case "send-to-space": {
      return { ...msgCmd, msg: fn(msgCmd.msg) };
    }
    default: {
      return ServerCmd.mapOne(fn, msgCmd);
    }
  }
};

const map = <A, B>(
  msgCmd: SpaceServerCmd<A>[] | undefined | null,
  fn: (a: A) => B
): SpaceServerCmd<B>[] | undefined => {
  return msgCmd?.map((m) => mapOne(fn, m));
};

const tag = <T extends string, A>(
  tag: T,
  msgCmd?: SpaceServerCmd<A>[]
): SpaceServerCmd<{ t: T; c: A }>[] | undefined => {
  return map(msgCmd ?? [], (c) => ({ t: tag, c }));
};

export const SpaceServerCmd = {
  map,
  mapOne,
  tag,
};
