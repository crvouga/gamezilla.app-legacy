import { Eff } from "./eff";
import { p } from "./pipe";
import { Result } from "./result";
import { Task } from "./task";

export type PutResult = Result<"failed_put_item_in_local_storage", null>;

export const put = <value, msg>(
  key: string,
  value: value,
  mapper: (result: PutResult) => msg
): Eff<msg> => {
  const task: Task<PutResult> = async () => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return Result.ok(null);
    } catch (error) {
      return Result.err("failed_put_item_in_local_storage");
    }
  };
  return p(task, Eff.perform(mapper));
};
