import { Route } from "./client-route";

export type ClientCmd<ToServer = unknown> =
  | SendToServerCmd<ToServer>
  | ToastCmd
  | RouteCmd
  | SoundCmd;

export type SendToServerCmd<T> = {
  t: "send-to-server";
  msg: T;
};

export type ToastCmd = {
  t: "toast/enqueue";
  text: string;
  variant?: "error" | "info";
  duration?: number;
};

export type SoundCmd =
  | {
      t: "sound/play";
      src: string;
      volume?: number;
    }
  | {
      t: "sound/preload";
      src: string[];
    };

export const APP_SOUND = {
  tap: "./tap.wav",
};

export const playSound = <T>(src: string, volume?: number): ClientCmd<T> => {
  return {
    t: "sound/play",
    src,
    volume,
  };
};

export const preloadSound = <T>(src: string[]): ClientCmd<T> => {
  return {
    t: "sound/preload",
    src,
  };
};

export const enqueueToast = <T>(
  text: string,
  variant?: "error" | "info",
  duration?: number
): ClientCmd<T> => {
  return { t: "toast/enqueue", text, variant, duration };
};

export type RouteCmd =
  | { t: "routing/push"; route: Route }
  | { t: "routing/back" };

export const pushRoute = <T>(route: Route): ClientCmd<T> => {
  return { t: "routing/push", route };
};

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
