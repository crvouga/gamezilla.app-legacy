import { andThen, p } from ".";
import { Cmd } from "./cmd";

export type Config<T> = {
  toId: (item: T) => string;
  enter: (item: T) => Promise<void>;
  exit: (item: T) => Promise<void>;
};

export const config = <T>(config: Config<T>): Config<T> => {
  return config;
};

export type TransitionItem<T> = {
  state: TransitionState;
  item: T;
};

export type TransitionState = "entering" | "entered" | "exiting" | "exited";

export type Model<T> = TransitionItem<T>[];

export const init = <T>(items: T[]): Model<T> => {
  return items.map((item): TransitionItem<T> => {
    return {
      state: "entered",
      item,
    };
  });
};

export type Msg<T> = { t: "entered"; items: T[] } | { t: "exited"; items: T[] };

export const watch = <T>({
  config,
  model,
  list,
}: {
  config: Config<T>;
  model: Model<T>;
  list: T[];
}): {
  model: Model<T>;
  cmd?: Cmd<Msg<T>>;
} => {
  const additions = difference(
    config.toId,
    list,
    model.map((x) => x.item)
  );
  const subtractions = difference(
    config.toId,
    model.map((x) => x.item),
    list
  );

  const cmd: Cmd<Msg<T>> = async (dispatch) => {
    const adds: Promise<void>[] = [];
    const subs: Promise<void>[] = [];

    for (const item of additions) {
      const found = model.find(
        (x) => config.toId(x.item) === config.toId(item)
      );
      if (!found) {
        adds.push(config.enter(item));
      }
    }

    for (const item of subtractions) {
      const found = model.find(
        (x) => config.toId(x.item) === config.toId(item)
      );

      if (found && (found.state === "entering" || found.state === "entered")) {
        subs.push(config.exit(item));
      }
    }

    await Promise.all([...subs, ...adds]);

    if (subs.length > 0) {
      dispatch({ t: "exited", items: subtractions });
    }

    if (adds.length > 0) {
      dispatch({ t: "entered", items: additions });
    }
  };

  const subtractionSet = new Set(subtractions.map(config.toId));

  const itemsNew: Model<T> = [
    ...model.map((item): TransitionItem<T> => {
      if (subtractionSet.has(config.toId(item.item))) {
        return {
          state: "exiting",
          item: item.item,
        };
      }
      return item;
    }),

    ...additions.map((item): TransitionItem<T> => {
      return {
        state: "entering",
        item,
      };
    }),
  ];

  return {
    model: itemsNew,
    cmd: cmd,
  };
};

export const update = <T>({
  config,
  model,
  list,
  msg,
}: {
  config: Config<T>;
  model: Model<T>;
  list: T[];
  msg?: Msg<T>;
}): {
  model: Model<T>;
  cmd?: Cmd<Msg<T>>;
} => {
  return p(
    watch({ config, model, list }),
    andThen(({ model }) => {
      if (!msg) {
        return { model };
      }

      if (msg.t === "entered") {
        return {
          model: model.map((x) => {
            if (msg.items.some((y) => config.toId(x.item) === config.toId(y))) {
              return {
                ...x,
                state: "entered",
              };
            }
            return x;
          }),
        };
      }

      if (msg.t === "exited") {
        return {
          model: model.filter((x) =>
            msg.items.every((y) => config.toId(x.item) !== config.toId(y))
          ),
        };
      }

      return { model };
    })
  );
};

const difference = <T>(
  toId: (x: T) => string | number,
  a: T[],
  b: T[]
): T[] => {
  const bKeys = new Set(b.map(toId));

  return a.filter((x) => !bKeys.has(toId(x)));
};

export function waitForElementById(htmlId: string, maxWait = 5000) {
  const element = document.getElementById(htmlId);

  if (element) {
    // If the element is already available, resolve the promise immediately
    return Promise.resolve(element);
  }

  return new Promise<HTMLElement | null>((resolve) => {
    const timeout = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, maxWait);
    const observer = new MutationObserver(() => {
      const targetElement = document.getElementById(htmlId);
      if (targetElement) {
        observer.disconnect();
        clearTimeout(timeout);
        resolve(targetElement);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}
