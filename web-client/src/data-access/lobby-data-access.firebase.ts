import type { IFirestore } from "./firebase-app";
import type { ILobbyDataAccess } from "./lobby-data-access.interface";

export const LobbyDataAccessFirebase = ({
  firestore,
}: {
  firestore: IFirestore;
}): ILobbyDataAccess => {
  return {
    async create({ userId }) {
      console.log("TODO create lobby", { userId });

      return {
        errors: [new Error("Failed to create lobby")],
      };
    },
  };
};
