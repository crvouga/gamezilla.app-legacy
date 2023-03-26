import { p } from './pipe';
import { Err, Ok, Result } from './result';

export type RemoteData<TError, TValue> =
  | NotAsked
  | Loading
  | Result<TError, TValue>;

export type NotAsked = { type: 'NotAsked' };
export const NotAsked: NotAsked = { type: 'NotAsked' };

export type Loading = { type: 'Loading' };
export const Loading: Loading = { type: 'Loading' };

export const map =
  <E, A, B>(mapper: (a: A) => B) =>
  (remoteData: RemoteData<E, A>): RemoteData<E, B> => {
    switch (remoteData.type) {
      case 'NotAsked':
      case 'Loading':
        return remoteData;

      case 'Err':
      case 'Ok':
        return p(remoteData, Result.map(mapper));
    }
  };

export const RemoteData = {
  map,
  Loading,
  NotAsked,
  Err,
  Ok,
};
