import { or } from '../schema/schema/schema-or'
import { Schema } from '../schema/schema/schema-types'
import { l, obj } from '../schema/schema/schema'
import type { Loading, NotAsked, RemoteResultInternal, ResultInternal } from './result'

export const schema = <TError, TValue>(
  errParser: Schema<TError>,
  okParser: Schema<TValue>,
): Schema<ResultInternal<TError, TValue>> => {
  return or(
    obj({
      t: l('err'),
      error: errParser,
    }),
    obj({
      t: l('ok'),
      value: okParser,
    }),
  )
}

export const remoteResultParser = <E, A>(error: Schema<E>, value: Schema<A>): Schema<RemoteResultInternal<E, A>> => {
  return or(
    obj<NotAsked>({
      t: l('not-asked'),
    }),
    obj<Loading>({ t: l('loading') }),
    schema(error, value),
  )
}
