import { UnitInterval } from "gamezilla/@SHARED/core";
import { AppRoute } from "./client-route";

//
//
//
//
//
//

export type ClientCmd<ToServer = null> =
  | SendToServerCmd<ToServer>
  | ToastCmd
  | RouteCmd
  | SoundCmd
  | ViewCmd;

//
//
//
//
//

export type SendToServerCmd<T> = {
  t: "send-to-server";
  msg: T | null;
};

/**
 * A cmd creator for sending a messages to the server.
 */
export const sendToServer = <T>(msg: T): ClientCmd<T> => {
  return {
    t: "send-to-server",
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

export const showToast = <T>(
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

export const playSound = <T>(src: string, volume?: UnitInterval): SoundCmd => {
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

export const focusView = <T>(htmlId: string): ClientCmd<T> => {
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

export const pushRoute = <T>(route: AppRoute): ClientCmd<T> => {
  return { t: "routing/push", route };
};

export const replaceRoute = <T>(route: AppRoute): ClientCmd<T> => {
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

const tagOne = <T extends string, Msg>(
  t: T,
  cmd: ClientCmd<Msg>
): ClientCmd<{ t: T; c: Msg }> => {
  switch (cmd.t) {
    case "send-to-server": {
      if (cmd.msg) {
        return { ...cmd, msg: { t, c: cmd.msg } };
      }
      return { ...cmd, msg: null };
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

const map = <A, B>(cmd: ClientCmd<A>[], f: (a: A) => B): ClientCmd<B>[] => {
  return cmd.map((cmd) => {
    switch (cmd.t) {
      case "send-to-server": {
        if (cmd.msg) {
          return { ...cmd, msg: f(cmd.msg) };
        }
        return { ...cmd, msg: null };
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
