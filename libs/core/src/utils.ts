import { Cmd } from './cmd';

export const exhaustive = (discriminatedUnionType: 'Missing Case!'): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`);
};

export const andThen =
  <Msg, Model, Action>(
    update: (input: { model: Model }) => {
      model: Model;
      cmd?: Cmd<Msg>;
      actions?: Action[];
    }
  ) =>
  (output: { actions?: Action[]; cmd?: Cmd<Msg>; model: Model }) => {
    const updated = update({ model: output.model });
    return {
      model: updated.model,
      cmd: Cmd.batch([updated.cmd, output.cmd]),
      actions: [...(output.actions || []), ...(updated.actions || [])],
    };
  };

export const t =
  <Tag extends string>(tag: Tag) =>
  <Value>(value: Value): [Tag, Value] =>
    [tag, value];

export type Unit = { type: 'Unit' };

export const Unit: Unit = { type: 'Unit' };

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
): boolean => a.every((a_i) => b.some((b_i) => eq(a_i, b_i)));

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

export const removeKey = <T>(key: keyof T, obj: T): Omit<T, keyof T> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: _value, ...rest } = obj;
  return rest;
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
