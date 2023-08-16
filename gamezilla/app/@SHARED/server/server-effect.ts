import { ClientId } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";

//
//
//
//
//
//
//

export type ServerEffect<ToClient> =
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

const tagServerEff = <T extends string, A>(
  tag: T,
  eff: ServerEffect<A>
): ServerEffect<{ t: T; c: A }> => {
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

const tagServerEffects = <T extends string, A>(
  tag: T,
  effects?: ServerEffect<A>[]
): ServerEffect<{ t: T; c: A }>[] | undefined => {
  return effects?.map((m) => tagServerEff(tag, m));
};

export const ServerEffect = {
  tag: tagServerEffects,
};
