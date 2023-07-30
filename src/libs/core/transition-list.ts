import { andThen, p } from ".";
import { Cmd } from "./cmd";

export type Config<T> = {
  toId: (item: T) => string;
  enter: (item: T) => Promise<void>;
  exit: (item: T) => Promise<void>;
};

type TransitionItem<T> = {
  t: "entering" | "entered" | "exiting" | "exited";
  item: T;
};

export type Model<T> = {
  items: TransitionItem<T>[];
};

export const init = <T>(items: T[]): Model<T> => {
  return {
    items: items.map((item) => {
      return {
        t: "entered",
        item,
      };
    }),
  };
};

export type Msg<T> = { t: "entered"; item: T } | { t: "exited"; item: T };

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
    model.items.map((x) => x.item)
  );

  const subtractions = difference(
    config.toId,
    model.items.map((x) => x.item),
    list
  );

  const cmd: Cmd<Msg<T>> = async (dispatch) => {
    const enter = async (item: T) => {
      await config.enter(item);
      dispatch({ t: "entered", item });
    };

    const exit = async (item: T) => {
      await config.exit(item);
      dispatch({ t: "exited", item });
    };

    const promises: Promise<void>[] = [];

    for (const item of additions) {
      promises.push(enter(item));
    }

    for (const item of subtractions) {
      promises.push(exit(item));
    }
  };

  const subtractionSet = new Set(subtractions.map(config.toId));

  const itemsNew: Model<T>["items"] = [
    ...model.items.map((item): TransitionItem<T> => {
      if (subtractionSet.has(config.toId(item.item))) {
        return {
          t: "exiting",
          item: item.item,
        };
      }
      return item;
    }),

    ...additions.map((item): TransitionItem<T> => {
      return {
        t: "entering",
        item,
      };
    }),
  ];

  return {
    model: {
      ...model,
      items: itemsNew,
    },
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
          model: {
            ...model,
            items: model.items.map((x) => {
              if (config.toId(x.item) === config.toId(msg.item)) {
                return {
                  ...x,
                  t: "entered",
                };
              }
              return x;
            }),
          },
        };
      }

      if (msg.t === "exited") {
        return {
          model: {
            ...model,
            items: model.items.filter(
              (x) => config.toId(x.item) !== config.toId(msg.item)
            ),
          },
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
  const bKeys = b.map(toId);

  return a.filter((x) => !bKeys.includes(toId(x)));
};
