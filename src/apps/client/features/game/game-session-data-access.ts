import { colyseusClient } from "../../data-access";
import { RoomNames } from "@libs/api-interfaces";

export type IGameSessionCreateResult =
  | { type: "success" }
  | { type: "error"; errors: [{ message: string }] };

export type IResult<TData = undefined> =
  | {
      type: "success";
      data: TData;
    }
  | {
      type: "error";
      errors: [
        {
          message: string;
        }
      ];
    };

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

export const create = async (): Promise<IResult> => {
  try {
    await colyseusClient.create(RoomNames.GameSession);

    return {
      type: "success",
      data: undefined,
    };
  } catch (error) {
    return {
      type: "error",
      errors: [
        {
          message: unknownErrorToMessage(error),
        },
      ],
    };
  }
};
