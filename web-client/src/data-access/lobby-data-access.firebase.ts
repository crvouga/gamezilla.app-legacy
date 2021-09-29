import {
  deleteDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import type { IFirestore } from "./firebase-app";
import {
  ILobbyDataAccess,
  ILobbyEvent,
  ILobbyState,
  lobbyStateReducer,
} from "./lobby-data-access.interface";

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

    const nextLobbyState: ILobbyState | null = lobbyStateReducer(
      lobbyState,
      lobbyEvent
    );

    await setDoc(doc(firestore, "lobbyEvents", lobbyEvent.eventId), lobbyEvent);

    if (nextLobbyState === null) {
      await deleteDoc(doc(firestore, "lobbyStates", lobbyEvent.lobbyId));
      return;
    }

    await setDoc(
      doc(firestore, "lobbyStates", lobbyEvent.lobbyId),
      nextLobbyState
    );
  };

  return {
    async create({ user }) {
      const lobbyEvent: ILobbyEvent = {
        eventId: generateId(),
        type: "USER_CREATED_LOBBY",
        lobbyId: generateId(),
        user,
      };

      await saveLobbyEvent(lobbyEvent);

      return {
        lobbyId: lobbyEvent.lobbyId,
        errors: [],
      };
    },

    async leave({ userId, lobbyId }) {
      const lobbyEvent: ILobbyEvent = {
        eventId: generateId(),
        type: "USER_LEFTED_LOBBY",
        lobbyId,
        userId,
      };

      await saveLobbyEvent(lobbyEvent);

      return {
        errors: [],
      };
    },

    onUserLobbyStatesChanged({ userId }, set) {
      const q = query(
        collection(firestore, "lobbyStates"),
        where(`users.${userId}.userId`, "==", userId)
      );

      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as ILobbyState);
        set(data);
      });
    },
  };
};
