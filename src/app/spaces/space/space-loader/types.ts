import { Result } from '~/@/result'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../space'

export type ModelFrontend = {}

export type MsgFrontend =
  | { t: 'space-loader.tick' }
  | { t: 'space-loader.upserted'; spaceId: SpaceId; upserted: Result<string, null> }
  | { t: 'space-loader.got-spaces'; spaces: Space.Model[] }
