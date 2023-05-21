import { p } from './pipe';
import { Err, Ok, Result } from './result';

export type RemoteResult<TError, TValue> =
  | NotAsked
  | Loading
  | Result<TError, TValue>;

export type NotAsked = { t: 'not-asked' };
export const NotAsked: NotAsked = { t: 'not-asked' };

export type Loading = { t: 'loading' };
export const Loading: Loading = { t: 'loading' };

export const map =
  <E, A, B>(mapper: (a: A) => B) =>
  (result: RemoteResult<E, A>): RemoteResult<E, B> => {
    switch (result.t) {
      case 'not-asked':
      case 'loading':
        return result;

      case 'err':
      case 'ok':
        return p(result, Result.map(mapper));
    }
  };

export const RemoteResult = {
  map,
  Loading,
  NotAsked,
  Err,
  Ok,
};
