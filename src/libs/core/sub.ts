import { p } from "./pipe";

export type Sub<Msg> = {
  subscribe: (subscriber: (msg: Msg) => void) => () => void;
};

type Pub<Msg> = {
  publish: (msg: Msg) => void;
  isSubscribed: () => boolean;
};

export type PubSub<Msg> = Pub<Msg> & Sub<Msg>;

export const create = <Msg>(): PubSub<Msg> => {
  let runningId = 0;
  const subscribers = new Map<number, (msg: Msg) => void>();

  return {
    isSubscribed: () => subscribers.size > 0,
    subscribe: (subscriber) => {
      const id = runningId + 1;
      subscribers.set(id, subscriber);
      return () => {
        subscribers.delete(id);
      };
    },
    publish: (msg: Msg) => {
      for (const subscriber of subscribers.values()) {
        subscriber(msg);
      }
    },
  };
};

export const map =
  <A, Msg>(f: (a: A) => Msg) =>
  (sub: Sub<A>): Sub<Msg> => {
    return {
      subscribe: (subscriber) => {
        return sub.subscribe((a) => {
          subscriber(f(a));
        });
      },
    };
  };

export const batch = <Msg>(arr: Sub<Msg>[]): Sub<Msg> => {
  return {
    subscribe: (subscriber) => {
      const unsubscribeList = arr.map((sub) => sub.subscribe(subscriber));
      return () => {
        for (const unsubscribe of unsubscribeList) {
          unsubscribe();
        }
      };
    },
  };
};

export const None: Sub<never> = {
  subscribe: () => () => {},
};

const tag = <Tag extends string, Msg>(
  t: Tag,
  sub: Sub<Msg>
): Sub<{ t: Tag; c: Msg }> => {
  return p(
    sub,
    Sub.map((c) => ({ t, c }))
  );
};

export const Sub = {
  map,
  batch,
  create,
  None,
  tag,
};
