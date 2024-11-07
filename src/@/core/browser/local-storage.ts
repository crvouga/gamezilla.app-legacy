import type { Eff } from '../eff'
import { Result } from '../result'

export type PutResult = Result<'failed_put_item_in_local_storage', null>

export const put =
  <value, msg>(key: string, value: value, mapper?: (result: PutResult) => msg): Eff<msg> =>
  (dispatch) => {
    const attempt = (): PutResult => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return Result.Ok(null)
      } catch (error) {
        return Result.Err('failed_put_item_in_local_storage')
      }
    }
    const result = attempt()
    if (mapper) {
      dispatch(mapper(result))
    }
  }
