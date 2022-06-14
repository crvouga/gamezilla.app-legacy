import { pipe } from "fp-ts/lib/function";
import { cmd } from "Framework";
import { Cmd } from "Framework/Cmd";

export const exhaustive = (
  discriminatedUnionType: "Missing Case Error"
): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`);
};

export type Group<GroupName extends string, Msg> = {
  group: GroupName;
} & Msg;

export const groupTag =
  <Msg, GroupName extends string>(group: GroupName) =>
  (msg: Msg): Group<GroupName, Msg> => {
    return { ...msg, group: group } as const;
  };

export const andThen =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
    msg: Msg
  ) =>
  ([model, cmdPrev]: [Model, Cmd<Msg>]): [Model, Cmd<Msg>] => {
    const [modelNew, cmdNew] = update(msg, model);

    return [modelNew, cmd.batch([cmdPrev, cmdNew])];
  };

export const andThenMany =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
    msgs: Msg[]
  ) =>
  ([modelPrev, cmdPrev]: [Model, Cmd<Msg>]): [Model, Cmd<Msg>] => {
    const [msg, ...msgsRest] = msgs;

    if (!msg) {
      return [modelPrev, cmdPrev];
    }

    const [modelNew, cmdNew] = update(msg, modelPrev);

    return pipe(
      [modelNew, cmd.batch([cmdPrev, cmdNew])],
      andThenMany(update, msgsRest)
    );
  };

/**
 *
 *
 *
 * debounce
 *
 *
 *
 */

export type Options<Result> = {
  isImmediate?: boolean;
  maxWait?: number;
  callback?: (data: Result) => void;
};

export interface DebouncedFunction<
  Args extends any[],
  F extends (...args: Args) => any
> {
  (this: ThisParameterType<F>, ...args: Args & Parameters<F>): Promise<
    ReturnType<F>
  >;
  cancel: (reason?: any) => void;
}

interface DebouncedPromise<FunctionReturn> {
  resolve: (result: FunctionReturn) => void;
  reject: (reason?: any) => void;
}

export function debounce<Args extends any[], F extends (...args: Args) => any>(
  func: F,
  waitMilliseconds = 50,
  options: Options<ReturnType<F>> = {}
): DebouncedFunction<Args, F> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const isImmediate = options.isImmediate ?? false;
  const callback = options.callback ?? false;
  const maxWait = options.maxWait;
  let lastInvokeTime = Date.now();

  let promises: DebouncedPromise<ReturnType<F>>[] = [];

  function nextInvokeTimeout() {
    if (maxWait !== undefined) {
      const timeSinceLastInvocation = Date.now() - lastInvokeTime;

      if (timeSinceLastInvocation + waitMilliseconds >= maxWait) {
        return maxWait - timeSinceLastInvocation;
      }
    }

    return waitMilliseconds;
  }

  const debouncedFunction = function (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ) {
    const context = this;
    return new Promise<ReturnType<F>>((resolve, reject) => {
      const invokeFunction = function () {
        timeoutId = undefined;
        lastInvokeTime = Date.now();
        if (!isImmediate) {
          const result = func.apply(context, args);
          callback && callback(result);
          promises.forEach(({ resolve }) => resolve(result));
          promises = [];
        }
      };

      const shouldCallNow = isImmediate && timeoutId === undefined;

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(invokeFunction, nextInvokeTimeout());

      if (shouldCallNow) {
        const result = func.apply(context, args);
        callback && callback(result);
        return resolve(result);
      }
      promises.push({ resolve, reject });
    });
  };

  debouncedFunction.cancel = function (reason?: any) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    promises.forEach(({ reject }) => reject(reason));
    promises = [];
  };

  return debouncedFunction;
}
