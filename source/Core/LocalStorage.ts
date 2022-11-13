import { Cmd } from "./Cmd"
import { p } from "./pipe"
import { Result } from "./Result"
import * as Task from "./Task"
import { Unit } from "./Utility"

export type PutResult = Result<"failed_put_item_in_local_storage", Unit>

export const put = <value, msg>(
  key: string,
  value: value,
  mapper: (result: PutResult) => msg,
): Cmd<msg> => {
  const task: Task.Task<PutResult> = async () => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return Result.Ok(Unit)
    } catch (error) {
      return Result.Err("failed_put_item_in_local_storage")
    }
  }
  return p(task, Cmd.perform(mapper))
}
