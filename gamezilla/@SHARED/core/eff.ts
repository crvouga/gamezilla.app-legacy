import { p } from "./utils/pipe";
import { Task } from "./task";

export type Eff<Msg = never> = (dispatch: (msg: Msg) => void) => void;

const of = <Msg>(msg: Msg): Eff<Msg> => {
  return (dispatch) => {
    dispatch(msg);
  };
};

const map =
  <A, B>(mapper: (a: A) => B) =>
  (eff: Eff<A>): Eff<B> => {
    return (dispatch) => {
      eff((a) => {
        dispatch(mapper(a));
      });
    };
  };

const map_ = <A, B>(
  mapper: (a: A) => B,
  eff?: Eff<A> | null | undefined
): Eff<B> => {
  if (!eff) {
    return None;
  }
  return (dispatch) => {
    eff((a) => {
      dispatch(mapper(a));
    });
  };
};

const chain =
  <A, B>(mapper: (a: A) => Eff<B>) =>
  (eff: Eff<A>): Eff<B> => {
    return (dispatch) => {
      eff((a) => {
        mapper(a)((b) => {
          dispatch(b);
        });
      });
    };
  };

const t = <Tag extends string, Msg>(
  tagName: Tag,
  eff: Eff<Msg> | undefined | null
): Eff<{ t: Tag; c: Msg }> => {
  if (!eff) {
    return None;
  }
  return p(
    eff,
    map((msg) => ({ t: tagName, c: msg }))
  );
};

const batch = <Msg>(
  ...effLists: (Eff<Msg> | undefined | null)[][]
): Eff<Msg> => {
  return (dispatch) => {
    for (const effList of effLists) {
      for (const eff of effList) {
        if (eff) {
          eff(dispatch);
        }
      }
    }
  };
};

const None: Eff = () => {
  // do nothing
};

const perform =
  <A, Msg>(f: (a: A) => Msg) =>
  (task: Task<A>): Eff<Msg> => {
    return async (dispatch) => {
      const value = await task();
      dispatch(f(value));
    };
  };

/**
 * An `Eff` represents a side effect that can be performed by the runtime.
 */
export const Eff = {
  None,
  perform,
  batch,
  t,
  chain,
  map,
  map_,
  of,
};
