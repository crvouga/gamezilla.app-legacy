import { either } from "fp-ts";
import { Either } from "fp-ts/lib/Either";
import { Task } from "fp-ts/lib/Task";

type Problem = "Unknown";

export const play =
  (file: string): Task<Either<Problem, {}>> =>
  async () => {
    try {
      const audio = new Audio(file);

      await audio.play();

      return either.right({});
    } catch (error) {
      return either.left("Unknown");
    }
  };
