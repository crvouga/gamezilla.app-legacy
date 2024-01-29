import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";

//
//
//
//
//
//
//

export type WireCmd<ToClient> = {
  t: "wire";
  c:
    | {
        t: "send-to-user";
        userIds: UserId[];
        msg: ToClient;
      }
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
        t: "send-to-session";
        sessionIds: SessionId[];
        msg: ToClient;
      }
    | {
        t: "topic-publish";
        topics: string[];
        msg: ToClient;
      }
    | {
        t: "topic-subscribe";
        topics: string[];
        clientIds: ClientId[];
      };
};

export type ServerCmd<TToClient> = WireCmd<TToClient>;

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
    t: "wire",
    c: {
      t: "topic-publish",
      topics,
      msg,
    },
  };
};

export const topicSubscribe = <ToClient>(
  topics: string[],
  clientIds: ClientId[]
): ServerCmd<ToClient> => {
  return {
    t: "wire",
    c: {
      t: "topic-subscribe",
      topics,
      clientIds,
    },
  };
};

export const broadcast = <ToClient>(msg: ToClient): ServerCmd<ToClient> => {
  return {
    t: "wire",
    c: {
      t: "broadcast",
      msg,
    },
  };
};

export const sendToClient = <ToClient>(
  clientIds: ClientId[],
  msg: ToClient
): ServerCmd<ToClient> => {
  return {
    t: "wire",
    c: {
      t: "send-to-client",
      clientIds,
      msg,
    },
  };
};

export const sendToSession = <ToClient>(
  sessionIds: SessionId[],
  msg: ToClient
): ServerCmd<ToClient> => {
  return {
    t: "wire",
    c: {
      t: "send-to-session",
      sessionIds,
      msg,
    },
  };
};

export const sendToUser = <ToClient>(
  userIds: UserId[],
  msg: ToClient
): ServerCmd<ToClient> => {
  return {
    t: "wire",
    c: {
      t: "send-to-user",
      userIds,
      msg,
    },
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

const mapOne = <A, B>(fn: (a: A) => B, msgCmd: ServerCmd<A>): ServerCmd<B> => {
  switch (msgCmd.t) {
    case "wire": {
      switch (msgCmd.c.t) {
        case "send-to-user":
        case "send-to-session":
        case "send-to-client":
        case "topic-publish":
        case "broadcast": {
          return { t: "wire", c: { ...msgCmd.c, msg: fn(msgCmd.c.msg) } };
        }
        case "topic-subscribe": {
          return {
            t: "wire",
            c: {
              t: "topic-subscribe",
              clientIds: msgCmd.c.clientIds,
              topics: msgCmd.c.topics,
            },
          };
        }
      }
    }
  }
};

const map = <A, B>(
  fn: (a: A) => B,
  msgCmd?: ServerCmd<A>[]
): ServerCmd<B>[] => {
  return msgCmd?.map((m) => mapOne(fn, m)) ?? [];
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
