import { Result } from '@/core'
import { UserActivity } from '../user-activity'

export type IUserActivityDb = {
  insert: (activity: UserActivity) => Promise<Result<string, null>>
}
