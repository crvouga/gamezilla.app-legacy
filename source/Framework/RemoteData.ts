export type RemoteData<TError, TValue> =
  | NotAsked
  | Loading
  | Failure<TError>
  | Success<TValue>;

export type NotAsked = { type: "NotAsked" };
export const NotAsked: NotAsked = { type: "NotAsked" };

export type Loading = { type: "Loading" };
export const Loading: Loading = { type: "Loading" };

export type Failure<TProblem> = { type: "Failure"; problem: TProblem };
export const Failure = <T>(problem: T): Failure<T> => ({
  type: "Failure",
  problem,
});

export type Success<TValue> = { type: "Success"; value: TValue };
export const Success = <T>(value: T): Success<T> => ({
  type: "Success",
  value,
});
