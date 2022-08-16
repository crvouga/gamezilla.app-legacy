import * as Result from "./Result"

export type RemoteData<TError, TValue> =
  | NotAsked
  | Loading
  | Failure<TError>
  | Success<TValue>

export type NotAsked = { type: "NotAsked" }
export const NotAsked: NotAsked = { type: "NotAsked" }

export type Loading = { type: "Loading" }
export const Loading: Loading = { type: "Loading" }

export type Failure<TProblem> = { type: "Failure"; problem: TProblem }
export const Failure = <T>(problem: T): Failure<T> => ({
  type: "Failure",
  problem,
})

export type Success<TValue> = { type: "Success"; value: TValue }
export const Success = <T>(value: T): Success<T> => ({
  type: "Success",
  value,
})

export const fromResult = <E, A>(
  result: Result.Result<E, A>,
): RemoteData<E, A> => {
  switch (result.type) {
    case "Err": {
      return Failure(result.error)
    }

    case "Ok": {
      return Success(result.value)
    }
  }
}

export const map =
  <E, A, B>(mapper: (a: A) => B) =>
  (remoteData: RemoteData<E, A>): RemoteData<E, B> => {
    switch (remoteData.type) {
      case "NotAsked":
      case "Loading":
      case "Failure":
        return remoteData

      case "Success":
        return Success(mapper(remoteData.value))
    }
  }
