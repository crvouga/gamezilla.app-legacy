import { or } from '../parser/parser/parser-or'
import { Parser } from '../parser/parser/parser-types'
import { l, obj } from '../parser/parser/parsers'
import type { Loading, NotAsked, RemoteResultInternal, ResultInternal } from './result'

export const parser = <TError, TValue>(
  errParser: Parser<TError>,
  okParser: Parser<TValue>
): Parser<ResultInternal<TError, TValue>> => {
  return or(
    obj({
      t: l('err'),
      error: errParser
    }),
    obj({
      t: l('ok'),
      value: okParser
    })
  )
}

export const remoteResultParser = <E, A>(error: Parser<E>, value: Parser<A>): Parser<RemoteResultInternal<E, A>> => {
  return or(
    obj<NotAsked>({
      t: l('not-asked')
    }),
    obj<Loading>({ t: l('loading') }),
    parser(error, value)
  )
}
