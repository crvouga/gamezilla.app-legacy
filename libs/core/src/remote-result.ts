import { p } from './pipe';
import { Err, Ok, Result } from './result';

export type RemoteResult<TError, TValue> =
  | NotAsked
  | Loading
  | Result<TError, TValue>;

export type NotAsked = { type: 'NotAsked' };
export const NotAsked: NotAsked = { type: 'NotAsked' };

export type Loading = { type: 'Loading' };
export const Loading: Loading = { type: 'Loading' };

export const map =
  <E, A, B>(mapper: (a: A) => B) =>
  (RemoteResult: RemoteResult<E, A>): RemoteResult<E, B> => {
    switch (RemoteResult.type) {
      case 'NotAsked':
      case 'Loading':
        return RemoteResult;

      case 'Err':
      case 'Ok':
        return p(RemoteResult, Result.map(mapper));
    }
  };

export const RemoteResult = {
  map,
  Loading,
  NotAsked,
  Err,
  Ok,
};
