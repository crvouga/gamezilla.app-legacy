import { Result } from '~/@/result'
import { PubSub, Sub } from '~/@/sub'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '..'

export type ISpaceDb = {
  get: (spaceIds: SpaceId[]) => Promise<Result<string, Space.Model[]>>

  upsert: (space: Space.Model) => Promise<Result<string, null>>
}

export type SpaceDbInputMsg = { t: 'dangerously-override-model'; model: Space.Model }
export type SpaceDbOutputMsg = { t: 'model-dangerously-overridden'; model: Space.Model }
export type SpaceDbConfig = { input?: Sub<SpaceDbInputMsg>; output?: PubSub<SpaceDbOutputMsg> }
