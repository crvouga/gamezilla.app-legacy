import { colyseusClient } from "../../data-access";
import { RoomNames } from "@libs/server-interface";

export type IGameSessionCreateResult =
  | { type: "success" }
  | { type: "error"; errors: [{ message: string }] };

export const create = async (): Promise<IGameSessionCreateResult> => {
  try {
    await colyseusClient.create(RoomNames.GameSession);
    return {
      type: "success",
    };
  } catch (error) {
    const message =
      (error as Error)?.toString?.() ??
      "Something went wrong for an unknown reason";

    return {
      type: "error",
      errors: [
        {
          message,
        },
      ],
    };
  }
};
