import { Route } from "./client-route";

export type ClientCmd<ToServer = unknown> =
  | { t: "send-to-server"; msg: ToServer }
  | ToastCmd
  | RouteCmd;

export type ToastCmd = { t: "toast/enqueue"; text: string; duration?: number };

export type RouteCmd =
  | { t: "routing/push"; route: Route }
  | { t: "routing/back" };

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
