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
      t: "wire/broadcast";
      msg: ToClient;
    }
  | {
      t: "wire/send-to-client";
      clientIds: ClientId[];
      msg: ToClient;
    }
  | {
      t: "wire/send-to-user";
      userIds: UserId[];
      msg: ToClient;
    }
  | {
      t: "wire/topic-publish";
      topics: string[];
      msg: ToClient;
    }
  | {
      t: "wire/topic-subscribe";
      topics: string[];
      clientIds: ClientId[];
    };

export const sendBack = <ToClient>(
  ctx: { clientId: ClientId },
  msg: ToClient
): ServerCmd<ToClient> => {
  return sendToClient([ctx.clientId], msg);
};

export const topicPublish = <ToClient>(
  topics: string[],
  msg: ToClient
): ServerCmd<ToClient> => {
  return {
    t: "wire/topic-publish",
    topics,
    msg,
  };
};

export const topicSubscribe = <ToClient>(
  topics: string[],
  clientIds: ClientId[]
): ServerCmd<ToClient> => {
  return {
    t: "wire/topic-subscribe",
    topics,
    clientIds,
  };
};

export const broadcast = <ToClient>(msg: ToClient): ServerCmd<ToClient> => {
  return {
    t: "wire/broadcast",
    msg,
  };
};

export const sendToClient = <ToClient>(
  clientIds: ClientId[],
  msg: ToClient
): ServerCmd<ToClient> => {
  return {
    t: "wire/send-to-client",
    clientIds,
    msg,
  };
};

export const sendToUser = <ToClient>(
  userIds: UserId[],
  msg: ToClient
): ServerCmd<ToClient> => {
  return {
    t: "wire/send-to-user",
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
    case "wire/send-to-client":
    case "wire/send-to-user":
    case "wire/topic-publish":
    case "wire/broadcast": {
      return { ...cmd, msg: fn(cmd.msg) };
    }
    case "wire/topic-subscribe": {
      return cmd;
    }
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
