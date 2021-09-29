import type { IFirestore } from "./firebase-app";
import {
  ILobby,
  ILobbyDataAccess,
  ILobbyEvent,
  ILobbyState,
  lobbyStateReducer,
} from "./lobby-data-access.interface";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const generateId = () => {
  return uuidv4();
};

export const LobbyDataAccessFirebase = ({
  firestore,
}: {
  firestore: IFirestore;
}): ILobbyDataAccess => {
  const saveLobbyEvent = async (lobbyEvent: ILobbyEvent) => {
    const lobbyStateResponse = await getDoc(
      doc(firestore, "lobbyStates", lobbyEvent.lobbyId)
    );

    const lobbyState = (lobbyStateResponse.data() ??
      null) as ILobbyState | null;

    const nextLobbyState = lobbyStateReducer(lobbyState, lobbyEvent);

    await setDoc(doc(firestore, "lobbyEvents", lobbyEvent.eventId), lobbyEvent);

    await setDoc(
      doc(firestore, "lobbyStates", lobbyEvent.lobbyId),
      nextLobbyState
    );
  };

  return {
    async create({ user }) {
      const lobbyEvent: ILobbyEvent = {
        eventId: generateId(),
        type: "USER_LOBBY_CREATED",
        lobbyId: generateId(),
        user,
      };

      await saveLobbyEvent(lobbyEvent);

      return {
        lobbyId: lobbyEvent.lobbyId,
        errors: [],
      };
    },
  };
};
