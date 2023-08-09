export const formatMsg = (msg: unknown): string => {
  try {
    return JSON.stringify(msg)
      .replace('"', "")
      .replace("[", "")
      .replace("]", "")
      .split(",")
      .join(".");
  } catch (_error) {
    return "";
  }
};

export const format = (msg: Array<unknown>) => {
  return flatten(msg).reduce<[string | null, unknown | null]>(
    ([msgType, payload], item) =>
      typeof item === "string"
        ? msgType
          ? [`${msgType}.${item}`, payload]
          : [item, payload]
        : [msgType, item],
    [null, null]
  );
};

const flatten = <T>(xs: T[] | T): T[] => {
  if (!Array.isArray(xs)) {
    return [xs];
  }
  return flatMap(xs, (x) => {
    if (Array.isArray(x)) {
      return flatten(x);
    }
    return [x];
  });
};

const flatMap = <T>(xs: T[], f: (x: T) => T[]): T[] => {
  return xs.reduce((acc, x) => [...acc, ...f(x)], [] as T[]);
};

export type Global = typeof window;

export type DebugData<Model, Msg> = [DebugAction<Msg>, Model];

export type DebugAction<Msg> = DebugInit | DebugMsg<Msg>;

export interface DebugInit {
  type: "INIT";
}

export const debugInit = (): DebugInit => ({ type: "INIT" });

export interface DebugMsg<Msg> {
  type: "MESSAGE";
  payload: Msg;
}

export const debugMsg = <Msg>(payload: Msg): DebugMsg<Msg> => ({
  type: "MESSAGE",
  payload,
});

export type MsgWithDebug<Model, Msg extends {}> =
  | Msg
  | { type: "__DebugUpdateModel__"; payload: Model }
  | { type: "__DebugApplyMsg__"; payload: Msg }
  | { type: "__DebugStarted__" };

export interface Debug<Model, Msg extends {}> {
  (data: DebugData<Model, Msg>): void;
}

export interface Debugger<Model, Msg extends {}> {
  (d: DebuggerDeps<Model, Msg>): {
    debug: Debug<Model, Msg>;
    stop: () => void;
  };
}

export interface DebuggerDeps<Model, Msg extends {}> {
  init: Model;

  dispatch: (m: MsgWithDebug<Model, Msg>) => void;
}
