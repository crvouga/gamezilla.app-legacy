import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../space'
import { SpaceDbQuery } from '../space-db/interface-query'

export type ModelFrontend = {
  'space-loader.results': {
    [queryKey: string]: SpaceId[]
  }
  'space-loader.queries': {
    [name: string]: SpaceDbQuery
  }
}

export const MsgFrontend = s.or(
  s.obj({
    t: s.l('space-loader.upserted'),
    spaceId: SpaceId,
    upserted: Result.schema(s.str(), s.unknown),
  }),
  s.obj({
    t: s.l('space-loader.got-spaces'),
    spaces: s.arr(Space.schema),
  }),
)
export type MsgFrontend = s.Infer<typeof MsgFrontend>
