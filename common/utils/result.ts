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

  if (isError(error)) {
    return error.message;
  }

  if (isToString(error)) {
    return `Something went wrong. ${error.toString()}`;
  }

  return `Something went wrong for an unknown reason`;
};

export type IResult<TData> =
  | {
      type: "success";
      data: TData;
    }
  | {
      type: "error";
      errors: Error[];
    };

export const tryCatch = async <TData>(
  f: () => Promise<TData>
): Promise<IResult<TData>> => {
  try {
    const data = await f();
    return {
      type: "success",
      data,
    };
  } catch (error) {
    return {
      type: "error",
      errors: [new Error(unknownErrorToMessage(error))],
    };
  }
};
