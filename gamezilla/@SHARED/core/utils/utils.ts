import { Eff } from "../eff";

export const exhaustive = (discriminatedUnionType: "Missing Case!"): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`);
};

/**
 * @description
 * A helper function for composing update functions
 */
export const andThen =
  <Msg, Model, Evt, Cmd>(
    updateStep: (input: Model) => {
      model: Model;
      eff?: Eff<Msg>;
      evt?: Evt[];
      cmd?: Cmd[];
    }
  ) =>
  (output: { eff?: Eff<Msg>; model: Model; evt?: Evt[]; cmd?: Cmd[] }) => {
    const updated = updateStep(output.model);
    return {
      model: updated.model,
      eff: Eff.batch([updated.eff, output.eff]),
      evt: [...(output.evt ?? []), ...(updated.evt ?? [])],
      cmd: [...(output.cmd ?? []), ...(updated.cmd ?? [])],
    };
  };

type Range = [number, number];
/**
 * @example
 * // assume a ∈ [0, 100]
 * const a = 10
 * const b = rescale({ value: a, from: [0, 100], to: [0, 10] }) //=> 1
 */
export const rescale = ({
  value,
  from,
  to,
}: {
  value: number;
  from: Range;
  to: Range;
}) => {
  return ((value - from[0]) * (to[1] - to[0])) / (from[1] - from[0]) + to[0];
};

/**
 * Takes elements from the start of the array while the predicate returns true.
 * @example
 * const isNeg = (x) => x < 0;
 * takeWhile(isNeg, [-2, -1, 0, 1, 2]); //=> [-2, -1]
 * takeWhile(isNeg, [-2, -1]); //=> [-2, -1]
 * takeWhile(isNeg, [1, 2, 3]); //=> []
 * takeWhile(isNeg, []); //=> []
 */
export const takeWhile = <T>(
  predicate: (item: T) => boolean,
  arr: Iterable<T>
): T[] => {
  const results: T[] = [];
  for (const item of arr) {
    if (!predicate(item)) {
      break;
    }
    results.push(item);
  }
  return results;
};

/**
 * @example
 * const strEq = (s1, s2) => String(s1) === String(s2)
 * unique(strEq, [1, '1', 2, 1]) //=> [1, 2]
 * unique(strEq, [{}, {}])       //=> [{}]
 * unique(strEq, [1, '1', 1])    //=> [1]
 * unique(strEq, ['1', 1, 1])    //=> ['1']
 */
export const unique = <X>(eq: (a: X, b: X) => boolean, xs: X[]): X[] => {
  const items: X[] = [];

  for (const x of xs) {
    if (!items.some((item) => eq(item, x))) {
      items.push(x);
    }
  }

  return items;
};

/**
 * @example
 * const eq = (a, b) => a === b
 * isSubset(eq, [], []) //=> true
 * isSubset(eq, [], ['a']) //=> true
 * isSubset(eq, ['a'], ['a']) //=> true
 * isSubset(eq, ['a'], ['a', 'b']) //=> true
 * isSubset(eq, ['a'], []) //=> false
 * isSubset(eq, ['a', 'b'], ['a']) //=> false
 */
export const isSubset = <X>(
  eq: (x1: X, x2: X) => boolean,
  a: X[],
  b: X[]
): boolean => {
  return a.every((x1) => b.some((x2) => eq(x1, x2)));
};

/**
 * @description
 * optimization for expensive function calls by caching results
 *
 * @example
 * // O(n^2) time complexity
 * const fibonacci = (n) =>
 *   n <= 1 ? 1 : fibonacci(n - 1) + fibonacci(n - 2)
 *
 * // O(n) time complexity
 * const memoizedFibonacci = memoize(fibonacci)
 *
 */
export const memoize = <X, Y>(toKey: (x: X) => string, f: (x: X) => Y) => {
  const cache = new Map<string, Y>();
  return (x: X): Y => {
    const key = toKey(x);
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
    const y = f(x);
    cache.set(key, y);
    return y;
  };
};

/**
 * @description
 * Removes a key from an object
 * @param key key to remove
 * @param obj some plain object
 * @returns `obj` with out the key `key`
 */
export const dissoc = <T>(obj: T, ...keys: (keyof T)[]): Omit<T, keyof T> => {
  const copied = { ...obj };
  for (const key of keys) {
    delete copied[key];
  }
  return copied;
};

type Entry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

export const filterObject = <T extends object>(
  obj: T,
  predicate: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean
): T => {
  const filtered = (Object.entries(obj) as Entry<T>[]).filter(predicate);
  return Object.fromEntries(filtered) as T;
};

export type AnyMsg = Record<string, unknown> & {
  t: string;
  c?: unknown;
};

export const isAnyMsg = (msg: unknown): msg is AnyMsg => {
  return typeof msg === "object" && msg !== null && "t" in msg;
};

export const toMsgType = (msg: AnyMsg): string => {
  if (isAnyMsg(msg.c)) {
    return `${msg.t}.${toMsgType(msg.c)}`;
  }
  return msg.t;
};

export const toMsgPayload = (
  msg: AnyMsg,
  acc: Record<string, unknown>
): Record<string, unknown> => {
  const { t, c, ...payload } = msg;
  if (isAnyMsg(msg.c)) {
    return toMsgPayload(msg.c, { ...acc, ...payload });
  }
  return { ...acc, ...payload };
};

export function descend<T>(keyFn: (value: T) => string) {
  return (a: T, b: T): number => {
    const aValue = keyFn(a);
    const bValue = keyFn(b);

    if (aValue > bValue) {
      return -1;
    } else if (aValue < bValue) {
      return 1;
    } else {
      return 0;
    }
  };
}

export function ascend<T>(keyFn: (value: T) => number) {
  return (a: T, b: T): number => {
    const aValue = keyFn(a);
    const bValue = keyFn(b);

    if (aValue < bValue) {
      return -1;
    } else if (aValue > bValue) {
      return 1;
    } else {
      return 0;
    }
  };
}

export function editDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }

  for (let j = 0; j <= n; j++) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dp[i][j] = Math.min(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dp[i - 1][j] + 1,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dp[i][j - 1] + 1,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dp[i - 1][j - 1] + cost
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return dp[m][n];
}

export function minBy<T, K>(arr: T[], keyFn: (value: T) => K): T | undefined {
  let min = arr[0];

  if (!min) {
    return undefined;
  }

  let minKey: K = keyFn(min);

  for (let i = 1; i < arr.length; i++) {
    const value = arr[i];

    if (!value) {
      return;
    }
    const key = keyFn(value);

    if (key < minKey) {
      min = value;
      minKey = key;
    }
  }

  return min;
}

export const matchSort = <T>(
  items: T[],
  toValue: (item: T) => string,
  value: string
): T[] => {
  return items
    .flatMap((item) => {
      const distance = editDistance(toValue(item), value);

      if (distance > 5) {
        return [];
      }

      return [item];
    })
    .sort(
      ascend((item) => {
        return editDistance(toValue(item), value);
      })
    );
};
