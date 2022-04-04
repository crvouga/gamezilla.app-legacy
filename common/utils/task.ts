import { IResult, Result } from "./result";

export type ITask<TData> = Promise<IResult<TData>>;

const tryCatch = async <TData>(f: () => Promise<TData>): ITask<TData> => {
  try {
    const data = await f();
    return Result.Ok(data);
  } catch (error) {
    return Result.Err(unknownErrorToMessage(error));
  }
};

export const Task = {
  tryCatch,
};

/*


utils


*/

const isError = (unknown: unknown): unknown is Error => {
  return (
    (unknown as Error)?.message !== undefined &&
    typeof (unknown as Error)?.message === "string"
  );
};

type ToString = {
  toString: () => string;
};

const isToString = (unknown: unknown): unknown is ToString => {
  return (
    (unknown as ToString)?.toString !== undefined &&
    typeof (unknown as ToString)?.toString === "function" &&
    typeof (unknown as ToString)?.toString?.() === "string"
  );
};

const unknownErrorToMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (isToString(error)) {
    return error.toString();
  }

  if (isError(error)) {
    return error.message;
  }

  return `Something went wrong for an unknown reason`;
};
