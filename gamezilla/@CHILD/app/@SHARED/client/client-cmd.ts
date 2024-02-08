import { TimeSpan, UnitInterval } from "gamezilla/@SHARED/core";
import { Profile, UserId } from "../data";
import { AppRoute } from "./client-route";

//
//
//
//
//
//

export type ClientCmdTypes = {
  MsgClient: any;
  MsgToServer: any;
};

export type ClientCmd<T extends ClientCmdTypes> =
  | WireCmd<T>
  | ToastCmd
  | RouteCmd
  | SoundCmd
  | PlatformCmd<T["MsgClient"]>
  | ProfileCmd;

//
//
//
//
//

export type ProfileCmd = {
  t: "profile";
  c: {
    t: "add-profiles";
    profiles: {
      [userId: UserId]: Profile;
    };
  };
};

export const addProfiles = <T extends ClientCmdTypes>(profiles: {
  [userId: UserId]: Profile;
}): ClientCmd<T> => {
  return { t: "profile", c: { t: "add-profiles", profiles } };
};

//
//
//
//
//

export type PlatformCmd<Msg> = {
  t: "platform";
  c:
    | {
        t: "focus";
        viewId: string;
      }
    | {
        t: "start-timeout";
        timeoutId: string | number;
        duration: TimeSpan;
        msg: Msg;
      }
    | {
        t: "cancel-timeout";
        timeoutId: string | number;
      };
};

export const focusView = <T extends ClientCmdTypes>(
  viewId: string
): ClientCmd<T> => {
  return { t: "platform", c: { t: "focus", viewId: viewId } };
};

export const startTimeout = <T extends ClientCmdTypes>(
  timeoutId: string | number,
  duration: TimeSpan,
  msg: T["MsgClient"]
): ClientCmd<T> => {
  return {
    t: "platform",
    c: {
      t: "start-timeout",
      timeoutId,
      duration,
      msg,
    },
  };
};

export const cancelTimeout = <T extends ClientCmdTypes>(
  timeoutId: string | number
): ClientCmd<T> => {
  return {
    t: "platform",
    c: {
      t: "cancel-timeout",
      timeoutId,
    },
  };
};

//
//
//
//
//

export type WireCmd<T extends ClientCmdTypes> = {
  t: "wire";
  c: {
    t: "send-to-server";
    msg: T["MsgToServer"] | null;
  };
};

/**
 * A msgCmd creator for sending a messages to the server.
 */
export const sendToServer = <T extends ClientCmdTypes>(
  msg: T["MsgToServer"]
): ClientCmd<T> => {
  return {
    t: "wire",
    c: {
      t: "send-to-server",
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

export type ToastCmd = {
  t: "toast";
  c: {
    t: "enqueue";
    text: string;
    toastVariant?: "error" | "info";
    duration?: TimeSpan;
    errorMsg?: string;
  };
};

export const showToast = <T extends ClientCmdTypes>(
  text: string,
  variant?: "error" | "info",
  duration?: TimeSpan
): ClientCmd<T> => {
  return {
    t: "toast",
    c: {
      t: "enqueue",
      text,
      toastVariant: variant,
      duration,
    },
  };
};

export const showOkToast = <T extends ClientCmdTypes>(
  text: string
): ClientCmd<T>[] => {
  return [
    {
      t: "toast",
      c: {
        t: "enqueue",
        text,
      },
    },
    {
      t: "sound",
      c: {
        t: "play",
        src: APP_SOUND.refreshFeed,
      },
    },
  ];
};

export const showErrorToast = <T extends ClientCmdTypes>(
  text: string,
  errorMsg?: string,
  duration?: TimeSpan
): ClientCmd<T>[] => {
  return [
    {
      t: "toast",
      c: {
        t: "enqueue",
        text,
        toastVariant: "error",
        errorMsg,
        duration: duration ?? TimeSpan.fromSeconds(4),
      },
    },
    {
      t: "sound",
      c: {
        t: "play",
        src: APP_SOUND.alertErrorSm,
      },
    },
  ];
};

//
//
//
//
//
//
//

export type SoundCmd = {
  t: "sound";
  c:
    | {
        t: "play";
        src: string;
        volume?: UnitInterval;
        delay?: TimeSpan;
      }
    | {
        t: "preload";
        src: string[];
      };
};

export const APP_SOUND = {
  tap: "./app/tap.wav",
  alertErrorLg: "./app/alert-error-lg.wav",
  alertErrorMd: "./app/alert-error-md.wav",
  alertErrorSm: "./app/alert-error-sm.wav",
  celebration: "./app/celebration.wav",
  navForward: "./app/nav-forward.wav",
  navBackward: "./app/nav-backward.wav",
  navForwardMin: "./app/nav-forward-min.wav",
  navBackwardMin: "./app/nav-backward-min.wav",
  navTransitionLeft: "./app/nav-transition-left.wav",
  stateChangeUp: "./app/state-change-up.wav",
  stateChangeDown: "./app/state-change-down.wav",
  refreshFeed: "./app/refresh-feed.wav",
};

export const playSound = (
  src: string,
  config?: {
    volume?: UnitInterval;
    delay?: TimeSpan;
  }
): SoundCmd => {
  return {
    t: "sound",
    c: {
      t: "play",
      src,
      volume: config?.volume,
      delay: config?.delay,
    },
  };
};

export const preloadSound = <T extends ClientCmdTypes>(
  src: string[]
): ClientCmd<T> => {
  return {
    t: "sound",
    c: {
      t: "preload",
      src,
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

export type RouteCmd = {
  t: "routing";
  c:
    | { t: "push"; route: AppRoute; playSound?: boolean }
    | {
        t: "replace";
        route: AppRoute;
        reason?: string;
      }
    | { t: "back"; reason?: string };
};

export const pushRoute = <T extends ClientCmdTypes>(
  route: AppRoute,
  playSound?: boolean
): ClientCmd<T> => {
  return {
    t: "routing",
    c: { t: "push", route, playSound },
  };
};

export const replaceRoute = <T extends ClientCmdTypes>(
  route: AppRoute,
  reason?: string
): ClientCmd<T> => {
  return {
    t: "routing",
    c: {
      t: "replace",
      route,
      reason,
    },
  };
};

export const back = <T extends ClientCmdTypes>(
  reason?: string
): ClientCmd<T> => {
  return {
    t: "routing",
    c: {
      t: "back",
      reason,
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

const tagOne = <Tag extends string, T extends ClientCmdTypes>(
  t: Tag,
  msgCmd: ClientCmd<T>
): ClientCmd<{
  MsgClient: { t: Tag; c: T["MsgClient"] };
  MsgToServer: { t: Tag; c: T["MsgToServer"] };
}> => {
  switch (msgCmd.t) {
    case "wire": {
      switch (msgCmd.c.t) {
        case "send-to-server": {
          if (msgCmd.c.msg) {
            return {
              ...msgCmd,
              c: { ...msgCmd.c, msg: { t, c: msgCmd.c.msg } },
            };
          }
          return { ...msgCmd, c: { ...msgCmd.c, msg: { t, c: null } } };
        }
      }
    }

    case "platform": {
      switch (msgCmd.c.t) {
        case "start-timeout": {
          return {
            ...msgCmd,
            c: {
              ...msgCmd.c,
              msg: {
                t,
                c: msgCmd.c.msg,
              },
            },
          };
        }

        default: {
          return msgCmd;
        }
      }
    }

    default: {
      return msgCmd;
    }
  }
};

const tag = <Tag extends string, T extends ClientCmdTypes>(
  tag: Tag,
  msgCmd?: (ClientCmd<T> | null | undefined)[] | null | undefined
): ClientCmd<{
  MsgClient: { t: Tag; c: T["MsgClient"] };
  MsgToServer: { t: Tag; c: T["MsgToServer"] };
}>[] => {
  return msgCmd?.flatMap((c) => (c ? [tagOne(tag, c)] : [])) ?? [];
};

const map = <A extends ClientCmdTypes, B extends ClientCmdTypes>(
  msgCmd: ClientCmd<A>[],
  toServerMap: (a: A["MsgToServer"]) => B["MsgToServer"],
  clientMsgMap: (b: A["MsgClient"]) => B["MsgClient"]
): ClientCmd<B>[] => {
  return msgCmd.map((msgCmd) => {
    switch (msgCmd.t) {
      case "wire": {
        switch (msgCmd.c.t) {
          case "send-to-server": {
            if (msgCmd.c.msg) {
              return {
                ...msgCmd,
                c: { ...msgCmd.c, msg: toServerMap(msgCmd.c.msg) },
              };
            }
            return { ...msgCmd, c: { ...msgCmd.c, msg: null } };
          }
        }
      }

      case "platform": {
        switch (msgCmd.c.t) {
          case "start-timeout": {
            return {
              ...msgCmd,
              c: {
                ...msgCmd.c,
                msg: clientMsgMap(msgCmd.c.msg),
              },
            };
          }

          default: {
            return msgCmd;
          }
        }
      }

      default: {
        return msgCmd;
      }
    }
  });
};
export const ClientCmd = {
  tagOne,
  tag,
  map,
};
