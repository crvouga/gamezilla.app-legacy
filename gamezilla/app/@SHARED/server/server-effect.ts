import { ClientId } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";

//
//
//
//
//
//
//

export type ServerCmd<ToClient> =
  | {
      t: "send-to-client";
      clientIds: ClientId[];
      msg: ToClient;
    }
  | {
      t: "broadcast";
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

//
//
//
//
//
//
//
//

const tagOne = <T extends string, A>(
  tag: T,
  cmd: ServerCmd<A>
): ServerCmd<{ t: T; c: A }> => {
  switch (cmd.t) {
    case "send-to-client":
    case "send-to-user":
    case "broadcast": {
      return { ...cmd, msg: { t: tag, c: cmd.msg } };
    }
    default:
      return cmd;
  }
};

const tag = <T extends string, A>(
  tag: T,
  commands?: ServerCmd<A>[]
): ServerCmd<{ t: T; c: A }>[] | undefined => {
  return commands?.map((m) => tagOne(tag, m));
};

export const ServerCmd = {
  tagOne,
  tag,
};
