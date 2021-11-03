import type { IUserId } from "../users";

export const createLobby = async (_: { userId: IUserId }) => {
  return {
    errors: [new Error("Something went wrong")],
  };
};
