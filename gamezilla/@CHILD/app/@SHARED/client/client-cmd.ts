import { UnitInterval } from "gamezilla/@SHARED/core";
import { AppRoute } from "./client-route";

//
//
//
//
//
//

type ClientCmdTypes = {
  ClientMsg: any;
  ToServer: any;
};

export type ClientCmd<T extends ClientCmdTypes> =
  | WireCmd<T>
  | ToastCmd
  | RouteCmd
  | SoundCmd
  | ViewCmd
  | TimeCmd<T>;

//
//
//
//
//

export type TimeCmd<T extends ClientCmdTypes> =
  | {
      t: "time/start-timeout";
      timeoutId: string;
      duration: number;
      msg: T["ClientMsg"];
    }
  | {
      t: "time/cancel-timeout";

      timeoutId: string;
    };

export const startTimeout = <T extends ClientCmdTypes>(
  timeoutId: string,
  duration: number,
  msg: T["ClientMsg"]
): ClientCmd<T> => {
  return {
    t: "time/start-timeout",
    timeoutId,
    duration,
    msg,
  };
};

export const cancelTimeout = <T extends ClientCmdTypes>(
  timeoutId: string
): ClientCmd<T> => {
  return {
    t: "time/cancel-timeout",
    timeoutId,
  };
};

//
//
//
//
//

export type WireCmd<T extends ClientCmdTypes> = {
  t: "wire/send-to-server";
  msg: T["ToServer"] | null;
};

/**
 * A cmd creator for sending a messages to the server.
 */
export const sendToServer = <T extends ClientCmdTypes>(
  msg: T["ToServer"]
): ClientCmd<T> => {
  return {
    t: "wire/send-to-server",
    msg,
  };
};

//
//
//
//
//
//

export type ToastCmd = {
  t: "toast/enqueue";
  text: string;
  variant?: "error" | "info";
  duration?: number;
};

export const showToast = <T extends ClientCmdTypes>(
  text: string,
  variant?: "error" | "info",
  duration?: number
): ClientCmd<T> => {
  return { t: "toast/enqueue", text, variant, duration };
};

//
//
//
//
//
//
//

export type SoundCmd =
  | {
      t: "sound/play";
      src: string;
      volume?: UnitInterval;
    }
  | {
      t: "sound/preload";
      src: string[];
    };

export const APP_SOUND = {
  tap: "./tap.wav",
  error: "./alert-error.wav",
  celebration: "./celebration.wav",
  navForward: "./nav-forward.wav",
  navBackward: "./nav-backward.wav",
  navForwardMin: "./nav-forward-min.wav",
  navBackwardMin: "./nav-backward-min.wav",
};

export const playSound = (src: string, volume?: UnitInterval): SoundCmd => {
  return {
    t: "sound/play",
    src,
    volume,
  };
};

export const preloadSound = <T extends ClientCmdTypes>(
  src: string[]
): ClientCmd<T> => {
  return {
    t: "sound/preload",
    src,
  };
};

//
//
//
//
//
//
//

type ViewCmd = {
  t: "view/focus";
  htmlId: string;
};

export const focusView = <T extends ClientCmdTypes>(
  htmlId: string
): ClientCmd<T> => {
  return { t: "view/focus", htmlId };
};

//
//
//
//
//
//
//
//

export type RouteCmd =
  | { t: "routing/push"; route: AppRoute }
  | { t: "routing/replace"; route: AppRoute }
  | { t: "routing/back" };

export const pushRoute = <T extends ClientCmdTypes>(
  route: AppRoute
): ClientCmd<T> => {
  return { t: "routing/push", route };
};

export const replaceRoute = <T extends ClientCmdTypes>(
  route: AppRoute
): ClientCmd<T> => {
  return { t: "routing/replace", route };
};

//
//
//
//
//
//
//
//

const tagOne = <Tag extends string, T extends ClientCmdTypes>(
  t: Tag,
  cmd: ClientCmd<T>
): ClientCmd<{
  ClientMsg: { t: Tag; c: T["ClientMsg"] };
  ToServer: { t: Tag; c: T["ToServer"] };
}> => {
  switch (cmd.t) {
    case "wire/send-to-server": {
      if (cmd.msg) {
        return { ...cmd, msg: { t, c: cmd.msg } };
      }
      return { ...cmd, msg: null };
    }

    case "time/start-timeout": {
      return {
        ...cmd,
        msg: { t, c: cmd.msg },
      };
    }

    default: {
      return cmd;
    }
  }
};

const tag = <Tag extends string, T extends ClientCmdTypes>(
  tag: Tag,
  cmd?: ClientCmd<T>[]
): ClientCmd<{
  ClientMsg: { t: Tag; c: T["ClientMsg"] };
  ToServer: { t: Tag; c: T["ToServer"] };
}>[] => {
  return cmd?.map((c) => tagOne(tag, c)) ?? [];
};

const map = <A extends ClientCmdTypes, B extends ClientCmdTypes>(
  cmd: ClientCmd<A>[],
  toServerMap: (a: A["ToServer"]) => B["ToServer"],
  clientMsgMap: (b: B["ClientMsg"]) => A["ClientMsg"]
): ClientCmd<B>[] => {
  return cmd.map((cmd) => {
    switch (cmd.t) {
      case "wire/send-to-server": {
        if (cmd.msg) {
          return { ...cmd, msg: toServerMap(cmd.msg) };
        }
        return { ...cmd, msg: null };
      }
      case "time/start-timeout": {
        return {
          ...cmd,
          msg: clientMsgMap(cmd.msg),
        };
      }
      default: {
        return cmd;
      }
    }
  });
};
export const ClientCmd = {
  tagOne,
  tag,
  map,
};
