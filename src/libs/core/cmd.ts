import { p } from "./pipe";
import { Task } from "./task";

export type Cmd<Msg = never> = (dispatch: (msg: Msg) => void) => void;

const of = <Msg>(msg: Msg): Cmd<Msg> => {
  return (dispatch) => {
    dispatch(msg);
  };
};

const map =
  <A, B>(mapper: (a: A) => B) =>
  (cmd: Cmd<A>): Cmd<B> => {
    return (dispatch) => {
      cmd((a) => {
        dispatch(mapper(a));
      });
    };
  };

const map_ = <A, B>(
  mapper: (a: A) => B,
  cmd?: Cmd<A> | null | undefined
): Cmd<B> => {
  if (!cmd) {
    return None;
  }
  return (dispatch) => {
    cmd((a) => {
      dispatch(mapper(a));
    });
  };
};

const chain =
  <A, B>(mapper: (a: A) => Cmd<B>) =>
  (cmd: Cmd<A>): Cmd<B> => {
    return (dispatch) => {
      cmd((a) => {
        mapper(a)((b) => {
          dispatch(b);
        });
      });
    };
  };

const t = <Tag extends string, Msg>(
  tagName: Tag,
  cmd: Cmd<Msg> | undefined | null
): Cmd<{ t: Tag; c: Msg }> => {
  if (!cmd) {
    return None;
  }
  return p(
    cmd,
    map((msg) => ({ t: tagName, c: msg }))
  );
};

const batch = <Msg>(
  ...cmdLists: (Cmd<Msg> | undefined | null)[][]
): Cmd<Msg> => {
  return (dispatch) => {
    for (const cmdList of cmdLists) {
      for (const cmd of cmdList) {
        if (cmd) {
          cmd(dispatch);
        }
      }
    }
  };
};

const None: Cmd = () => {
  // do nothing
};

const perform =
  <A, Msg>(f: (a: A) => Msg) =>
  (task: Task<A>): Cmd<Msg> => {
    return async (dispatch) => {
      const value = await task();
      dispatch(f(value));
    };
  };

export const Cmd = {
  None,
  perform,
  batch,
  t,
  chain,
  map,
  map_,
  of,
};
