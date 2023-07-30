import { andThen, p } from ".";
import { Cmd } from "./cmd";

export type Config<TItem, TNode = HTMLElement> = {
  toId: (item: TItem) => string;
  enter: (item: TNode) => Promise<void>;
  exit: (item: TNode) => Promise<void>;
  getNode?: (id: string) => TNode | null;
};

const getNode = <TItem, TNode>(config: Config<TItem, TNode>, item: TItem) => {
  const id = config.toId(item);
  if (!config.getNode) {
    const got = document.getElementById(id);
    return got;
  }
  return config.getNode(id);
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

export type Msg<T> =
  | { t: "entering"; item: T }
  | { t: "entered"; item: T }
  | { t: "exiting"; item: T }
  | { t: "exited"; item: T };

export const update = <T>({
  config,
  model,
  items,
  msg,
}: {
  config: Config<T>;
  model: Model<T>;
  items: T[];
  msg?: Msg<T>;
}): {
  model: Model<T>;
  cmd?: Cmd<Msg<T>>;
} => {
  return p(
    updateLifecycle({ config, model, items }),
    andThen(({ model }) => {
      if (!msg) {
        console.log("no msg");
        return { model };
      }

      if (msg.t === "entering") {
        return {
          model: {
            ...model,
          },
        };
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

      if (msg.t === "exiting") {
        return {
          model: {
            ...model,
            items: model.items.map((x) => {
              if (config.toId(x.item) === config.toId(msg.item)) {
                return {
                  ...x,
                  t: "exiting",
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

const updateLifecycle = <T>({
  config,
  model,
  items,
}: {
  config: Config<T>;
  model: Model<T>;
  items: T[];
}): {
  model: Model<T>;
  cmd: Cmd<Msg<T>>;
} => {
  const additions = difference(
    config.toId,
    items,
    model.items.map((x) => x.item)
  );
  const subtractions = difference(
    config.toId,
    model.items.map((x) => x.item),
    items
  );
  console.log({
    additions,
    subtractions,
  });

  const enterCmd: Cmd<Msg<T>> = async (dispatch) => {
    for (const item of additions) {
      await new Promise((resolve) => setTimeout(resolve, 1));

      const node = getNode(config, item);

      if (node) {
        await config.enter(node);
      }
      dispatch({ t: "entered", item });
    }
  };

  const exitCmd: Cmd<Msg<T>> = async (dispatch) => {
    for (const item of subtractions) {
      const node = getNode(config, item);

      if (node) {
        await config.exit(node);
      }
      dispatch({ t: "exited", item });
    }
  };

  return {
    model: {
      ...model,
      items: [
        ...model.items,
        ...additions.map(
          (item): TransitionItem<T> => ({ t: "entering", item })
        ),
      ],
    },
    cmd: Cmd.batch([enterCmd, exitCmd]),
  };
};

const difference = <T>(
  toId: (x: T) => string | number,
  a: T[],
  b: T[]
): T[] => {
  const bKeys = b.map(toId);

  return a.filter((x) => !bKeys.includes(toId(x)));
};
