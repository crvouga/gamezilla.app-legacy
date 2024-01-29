import { p } from "./utils/pipe";
import { Task } from "./task";

export type Eff<Msg = never> = (emit: (msg: Msg) => void) => void;

const of = <Msg>(msg: Msg): Eff<Msg> => {
  const eff: Eff<Msg> = (emit) => {
    emit(msg);
  };
  return eff;
};

const map =
  <A, B>(mapper: (a: A) => B) =>
  (eff: Eff<A>): Eff<B> => {
    const mappedEff: Eff<B> = (emit) => {
      eff((a) => {
        emit(mapper(a));
      });
    };
    return mappedEff;
  };

const map_ = <A, B>(
  mapper: (a: A) => B,
  eff?: Eff<A> | null | undefined
): Eff<B> => {
  if (!eff) {
    return None;
  }
  return (emit) => {
    eff((a) => {
      emit(mapper(a));
    });
  };
};

const chain =
  <A, B>(mapper: (a: A) => Eff<B>) =>
  (eff: Eff<A>): Eff<B> => {
    return (emit) => {
      eff((a) => {
        mapper(a)((b) => {
          emit(b);
        });
      });
    };
  };

const tag = <Tag extends string, Msg>(
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
  const batchedEff: Eff<Msg> = (emit) => {
    for (const effList of effLists) {
      for (const eff of effList) {
        if (eff) {
          eff(emit);
        }
      }
    }
  };

  return batchedEff;
};

const None: Eff = () => {
  // do nothing
};

const perform =
  <A, Msg>(f: (a: A) => Msg) =>
  (task: Task<A>): Eff<Msg> => {
    return async (emit) => {
      const value = await task();
      emit(f(value));
    };
  };

/**
 * An `Eff` represents a side effect that can be performed by the runtime.
 */
export const Eff = {
  None,
  perform,
  batch,
  tag,
  chain,
  map,
  map_,
  of,
};
