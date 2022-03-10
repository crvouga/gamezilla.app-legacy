import { Room } from "colyseus.js";
import { useState } from "react";
import { RoomNames } from "../../../common";
import { colyseusClient } from "../../data-access";

export type IResult<TData = undefined> =
  | {
      type: "success";
      data: TData;
    }
  | {
      type: "error";
      error: Error;
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

export const create = async (): Promise<IResult<Room<unknown>>> => {
  try {
    const room = await colyseusClient.create(RoomNames.Game);

    return {
      type: "success",
      data: room,
    };
  } catch (error) {
    return {
      type: "error",
      error: new Error(unknownErrorToMessage(error)),
    };
  }
};
