import { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '..'

export type ISpaceDb = {
  get: (spaceIds: SpaceId[]) => Promise<Result<string, Space.Model[]>>

  upsert: (space: Space.Model) => Promise<Result<string, null>>
}

export type SpaceDbConfig = {
  /**
   * This is used for testing purposes only. Testing invalid data
   */
  _dangerouslyOverrideModel?: Sub<Space.Model>
}
