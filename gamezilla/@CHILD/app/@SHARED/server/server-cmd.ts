import { ClientId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";

//
//
//
//
//
//
//

export type ServerCmd<ToClient> =
  | {
      t: "broadcast";
      msg: ToClient;
    }
  | {
      t: "send-to-client";
      clientIds: ClientId[];
      msg: ToClient;
    }
  | {
      t: "send-to-user";
      userIds: UserId[];
      msg: ToClient;
    };

export const sendBack = <ToClient>(
  ctx: { clientId: ClientId },
  msg: ToClient
): ServerCmd<ToClient> => {
  return {
    t: "send-to-client",
    clientIds: [ctx.clientId],
    msg,
  };
};

export const broadcast = <ToClient>(msg: ToClient): ServerCmd<ToClient> => {
  return {
    t: "broadcast",
    msg,
  };
};

export const sendToClient = <ToClient>(
  clientIds: ClientId[],
  msg: ToClient
): ServerCmd<ToClient> => {
  return {
    t: "send-to-client",
    clientIds,
    msg,
  };
};

export const sendToUser = <ToClient>(
  userIds: UserId[],
  msg: ToClient
): ServerCmd<ToClient> => {
  return {
    t: "send-to-user",
    userIds,
    msg,
  };
};

//
//
//
//
//
//
//
//

const mapOne = <A, B>(fn: (a: A) => B, cmd: ServerCmd<A>): ServerCmd<B> => {
  switch (cmd.t) {
    case "send-to-client":
    case "send-to-user":
    case "broadcast": {
      return { ...cmd, msg: fn(cmd.msg) };
    }
    default:
      return cmd;
  }
};

const map = <A, B>(fn: (a: A) => B, cmd?: ServerCmd<A>[]): ServerCmd<B>[] => {
  return cmd?.map((m) => mapOne(fn, m)) ?? [];
};

const tag = <T extends string, A>(
  tag: T,
  commands?: ServerCmd<A>[]
): ServerCmd<{ t: T; c: A }>[] | undefined => {
  return map((c) => ({ t: tag, c }), commands);
};

export const ServerCmd = {
  mapOne,
  map,
  tag,
};
