import * as Result from "./Result";
import * as Task from "./Task";

type Problem = "Unknown";

export const play =
  (file: string): Task.Task<Result.Result<Problem, {}>> =>
  async () => {
    try {
      const audio = new Audio(file);

      await audio.play();

      return Result.Ok({});
    } catch (error) {
      return Result.Err("Unknown");
    }
  };
