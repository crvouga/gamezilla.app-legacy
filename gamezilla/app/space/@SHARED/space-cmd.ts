import { ServerCmd } from "gamezilla/app/@SHARED/server";

export type SpaceServerCmd<ToClient> =
  | ServerCmd<ToClient>
  | { t: "send-to-space"; msg: ToClient };

export const sendToSpace = <ToClient>(
  msg: ToClient
): SpaceServerCmd<ToClient> => {
  return { t: "send-to-space", msg };
};

const mapOne = <A, B>(
  fn: (a: A) => B,
  cmd: SpaceServerCmd<A>
): SpaceServerCmd<B> => {
  switch (cmd.t) {
    case "send-to-space": {
      return { ...cmd, msg: fn(cmd.msg) };
    }
    default: {
      return ServerCmd.mapOne(fn, cmd);
    }
  }
};

const map = <A, B>(
  fn: (a: A) => B,
  cmd?: SpaceServerCmd<A>[]
): SpaceServerCmd<B>[] | undefined => {
  return cmd?.map((m) => mapOne(fn, m));
};

const tag = <T extends string, A>(
  tag: T,
  cmd?: SpaceServerCmd<A>[]
): SpaceServerCmd<{ t: T; c: A }>[] | undefined => {
  return map((c) => ({ t: tag, c }), cmd);
};

export const SpaceServerCmd = {
  map,
  mapOne,
  tag,
};
