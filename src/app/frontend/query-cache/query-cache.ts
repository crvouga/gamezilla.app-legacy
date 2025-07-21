import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { GotQueryCacheMsg } from './got-query-cache-msg.$msg'
import { Sub } from '~/@/sub'

export type QueryCache = {
  queries: {
    [queryKey: string]: Record<string, unknown>
  }
  results: {
    [queryKey: string]: string[]
  }
  entities: {
    [entityId: string]: Record<string, unknown>
  }
}

const init = (): QueryCache => {
  return {
    queries: {},
    results: {},
    entities: {},
  }
}

export const Msg = s.obj({
  t: s.l('got-entities'),
  query: s.dict(s.str(), s.unknown),
  entities: s.dict(s.str(), s.dict(s.str(), s.unknown)),
  results: s.arr(s.str()),
})

export type Msg = s.Infer<typeof Msg>

type Module = AppFrontendModule<{
  Model: QueryCache
  Msg: Msg
  Ctx: AppFrontendCtxBase
}>

const update: Module['update'] = (input) => {
  if (GotQueryCacheMsg.is(input.msgIn)) {
    const entitiesNew = { ...input.model.entities }
    for (const entityId in input.msgIn.c.entities) {
      entitiesNew[entityId] = { ...(entitiesNew[entityId] ?? {}), ...input.msgIn.c.entities[entityId] }
    }
    const queryKey = deterministicJsonStringify(input.msgIn.c.query)
    const queriesNew = {
      ...input.model.queries,
      [queryKey]: input.msgIn.c.query,
    }
    const resultsNew = {
      ...input.model.results,
      [queryKey]: input.msgIn.c.results,
    }
    return {
      model: {
        entities: entitiesNew,
        queries: queriesNew,
        results: resultsNew,
      },
    }
  }
  return { model: input.model }
}

export const createQuery = <
  TQuery extends Record<string, unknown>,
  TEntity extends Record<string, unknown>,
  TEntityId extends string,
>() => {
  return {
    sub: (sub: Sub<{ query: TQuery; entities: { [id in TEntityId]: TEntity }; results: TEntityId[] }>) =>
      Sub.map(sub, (input) =>
        GotQueryCacheMsg.init({
          t: 'got-entities',
          query: input.query,
          entities: input.entities,
          results: input.results,
        }),
      ),
    read: (input: { query: TQuery; model: QueryCache }): TEntity[] => {
      const queryKey = deterministicJsonStringify(input.query)
      const results = input.model.results[queryKey]
      const entities = results?.map((id) => input.model.entities[id] as TEntity) ?? []
      return entities
    },
  }
}

export const QueryCache = {
  init,
  update,
  createQuery,
}
