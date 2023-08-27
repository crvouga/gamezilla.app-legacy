import { Profile, UserId } from "gamezilla/app/@SHARED/data";
import { Route } from "./client-route";

export type ClientAppMsg =
  | { t: "route-changed"; route: Route }
  | { t: "route-push"; route: Route }
  | { t: "route-back" }
  | { t: "server-connected" }
  | { t: "enqueue-toast"; text: string; duration?: number }
  | { t: "got-profiles"; profiles: { [userId: UserId]: Profile } }
  | { t: "client-authenticated"; userId: UserId }
  | { t: "client-unauthenticated" };

export type ClientEvt =
  | { t: "client-authenticated"; userId: UserId }
  | { t: "client-unauthenticated" }
  | { t: "got-profiles"; profiles: { [userId: UserId]: Profile } }
  | { t: "route-changed"; route: Route };

export type ClientCmd<ToServer> =
  | { t: "send-to-server"; msg: ToServer }
  | { t: "enqueue-toast"; text: string; duration?: number }
  | { t: "route-push"; route: Route }
  | { t: "route-back" };

const tagOne = <T extends string, Msg>(
  t: T,
  cmd: ClientCmd<Msg>
): ClientCmd<{ t: T; c: Msg }> => {
  switch (cmd.t) {
    case "send-to-server": {
      return { ...cmd, msg: { t, c: cmd.msg } };
    }
    default: {
      return cmd;
    }
  }
};

const tag = <T extends string, Msg>(
  t: T,
  cmd?: ClientCmd<Msg>[]
): ClientCmd<{ t: T; c: Msg }>[] => {
  return cmd?.map((c) => tagOne(t, c)) ?? [];
};

export const ClientCmd = {
  tagOne,
  tag,
};
