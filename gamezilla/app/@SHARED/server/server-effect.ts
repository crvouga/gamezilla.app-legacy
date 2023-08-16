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

//
//
//
//
//
//
//
//

const tagCmd = <T extends string, A>(
  tag: T,
  eff: ServerCmd<A>
): ServerCmd<{ t: T; c: A }> => {
  switch (eff.t) {
    case "send-to-client":
    case "send-to-user":
    case "broadcast": {
      return { ...eff, msg: { t: tag, c: eff.msg } };
    }
    default:
      return eff;
  }
};

const tagCmds = <T extends string, A>(
  tag: T,
  effects?: ServerCmd<A>[]
): ServerCmd<{ t: T; c: A }>[] | undefined => {
  return effects?.map((m) => tagCmd(tag, m));
};

export const ServerCmd = {
  tag: tagCmds,
};
