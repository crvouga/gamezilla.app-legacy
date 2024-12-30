import { Result } from '~/@/result'
import { UserActivity } from '../user-activity'

export type IUserActivityDb = {
  insert: (activity: UserActivity) => Promise<Result<string, null>>
}
