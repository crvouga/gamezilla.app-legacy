import * as Result from "./Result";

export type Model<TError, TValue> =
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

export const fromResult = <E, A>(result: Result.Result<E, A>): Model<E, A> => {
  return Result.fold<E, A, Model<E, A>>(Failure, Success)(result);
};

export const mapSuccess =
  <E, A, B>(mapper: (a: A) => B) =>
  (remoteData: Model<E, A>): Model<E, B> => {
    switch (remoteData.type) {
      case "NotAsked":
      case "Loading":
      case "Failure":
        return remoteData;

      case "Success":
        return Success(mapper(remoteData.value));
    }
  };
