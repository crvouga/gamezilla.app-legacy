import { Result } from "../data/result"
import { Eff } from "../eff"

export type PutResult = Result<"failed_put_item_in_local_storage", null>

export const put =
  <value, msg>(
    key: string,
    value: value,
    mapper?: (result: PutResult) => msg,
  ): Eff<msg> =>
  (dispatch) => {
    const attempt = (): PutResult => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return Result.ok(null)
      } catch (error) {
        return Result.err("failed_put_item_in_local_storage")
      }
    }
    const result = attempt()
    if (mapper) {
      dispatch(mapper(result))
    }
  }
