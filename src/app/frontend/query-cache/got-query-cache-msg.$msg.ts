import { isOk } from '~/@/result'
import { s } from '~/@/schema'

export const Msg = s.or(
  s.obj({
    t: s.l('gotEntities'),
    query: s.dict(s.str(), s.unknown),
    entityType: s.str(),
    entities: s.dict(s.str(), s.dict(s.str(), s.unknown)),
    results: s.arr(s.str()),
    lastUpdatedAtKey: s.str(),
  }),
  s.obj({
    t: s.l('got-entity'),
    id: s.str(),
    entityType: s.str(),
    entity: s.dict(s.str(), s.unknown),
    lastUpdatedAtKey: s.str(),
  }),
)

export type Msg = s.Infer<typeof Msg>

const schema = s.obj({
  t: s.l('gotQueryCacheMsg'),
  c: Msg,
})

export type GotQueryCacheMsg = s.Infer<typeof schema>

export type MsgShared = GotQueryCacheMsg

const is = (input: unknown): input is GotQueryCacheMsg => {
  return isOk(schema.parse(input))
}

const init = (msg: Msg): GotQueryCacheMsg => {
  return { t: 'gotQueryCacheMsg', c: msg }
}

export const GotQueryCacheMsg = {
  schema: schema,
  is,
  init,
}
