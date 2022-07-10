import { Result, Task } from "Core";

export type CopyResult = Result.Result<Problem, {}>;

export type Problem = { message: string };

export const copy =
  (text: string): Task.Task<CopyResult> =>
  async () => {
    try {
      await navigator.clipboard.writeText(text);
      return Result.Ok({});
    } catch {
      return Result.Err({ message: "Failed to copy to clipboard." });
    }
  };
