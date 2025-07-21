import { isOk } from '~/@/result'
import { s } from '~/@/schema'
import { Msg } from './query-cache'

const schema = s.obj({
  t: s.l('got-query-cache-msg'),
  c: Msg,
})

export type GotQueryCacheMsg = s.Infer<typeof schema>

export type MsgShared = GotQueryCacheMsg

const is = (input: unknown): input is GotQueryCacheMsg => {
  return isOk(schema.parse(input))
}

const init = (msg: Msg): GotQueryCacheMsg => {
  return { t: 'got-query-cache-msg', c: msg }
}

export const GotQueryCacheMsg = {
  schema: schema,
  is,
  init,
}
