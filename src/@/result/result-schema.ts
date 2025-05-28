import { or } from '../schema/schema/schema-or'
import { Parser } from '../schema/schema/schema-types'
import { l, obj } from '../schema/schema/schema'
import type { Loading, NotAsked, RemoteResultInternal, ResultInternal } from './result'

export const schema = <TError, TValue>(
  errParser: Parser<TError>,
  okParser: Parser<TValue>,
): Parser<ResultInternal<TError, TValue>> => {
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

export const remoteResultParser = <E, A>(error: Parser<E>, value: Parser<A>): Parser<RemoteResultInternal<E, A>> => {
  return or(
    obj<NotAsked>({
      t: l('not-asked'),
    }),
    obj<Loading>({ t: l('loading') }),
    schema(error, value),
  )
}
