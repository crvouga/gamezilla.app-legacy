import { Result } from "../data/result";
import { Task } from "../task";

export type CopyResult = Result<Problem, null>;

export type Problem = { message: string };

export const copy =
  (text: string): Task<CopyResult> =>
  async () => {
    try {
      await navigator.clipboard.writeText(text);
      return Result.ok(null);
    } catch {
      return Result.err({ message: "Failed to copy to clipboard." });
    }
  };
