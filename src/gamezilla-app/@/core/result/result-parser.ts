import { or } from '../parser/parser/parser-or'
import { Parser } from '../parser/parser/parser-types'
import { l, obj } from '../parser/parser/parsers'
import type { Loading, NotAsked, RemoteResultPrivate, ResultPrivate } from './result'

export const parser = <TError, TValue>(
  errParser: Parser<TError>,
  okParser: Parser<TValue>
): Parser<ResultPrivate<TError, TValue>> => {
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

export const remoteResultParser = <E, A>(error: Parser<E>, value: Parser<A>): Parser<RemoteResultPrivate<E, A>> => {
  return or(
    obj<NotAsked>({
      t: l('not-asked')
    }),
    obj<Loading>({ t: l('loading') }),
    parser(error, value)
  )
}
