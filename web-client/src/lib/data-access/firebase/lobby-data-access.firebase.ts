import { generateUniqueId } from "$lib/utility";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {
  ILobbyDataAccess,
  ILobbyEvent,
  ILobbyState,
  lobbyStateReducer,
} from "../lobby-data-access.interface";
import type { IFirestore } from "./firebase-app";

export const LobbyDataAccessFirebase = ({
  firestore,
}: {
  firestore: IFirestore;
}): ILobbyDataAccess => {
  const getLobbyState = async ({ lobbyId }: { lobbyId: string }) => {
    const response = await getDoc(doc(firestore, "lobbyStates", lobbyId));

    const data = response.data();

    const lobbyState = (data ?? null) as ILobbyState | null;

    return lobbyState;
  };

  const setLobbyEvent = async (eventId: string, lobbyEvent: ILobbyEvent) => {
    await setDoc(doc(firestore, "lobbyEvents", eventId), lobbyEvent);
  };

  const setLobbyState = async (
    lobbyId: string,
    lobbyState: ILobbyState | null
  ) => {
    const ref = doc(firestore, "lobbyStates", lobbyId);

    if (lobbyState === null) {
      await deleteDoc(ref);
      return;
    }

    await setDoc(ref, lobbyState);
  };

  const dispatch = async (lobbyEvent: ILobbyEvent) => {
    const { lobbyId, eventId } = lobbyEvent;

    const lobbyState = await getLobbyState({ lobbyId });

    const nextLobbyState = lobbyStateReducer(lobbyState, lobbyEvent);

    await setLobbyEvent(eventId, lobbyEvent);

    await setLobbyState(lobbyId, nextLobbyState);
  };

  return {
    async create({ user }) {
      const lobbyEvent: ILobbyEvent = {
        eventId: generateUniqueId(),
        type: "USER_CREATED_LOBBY",
        lobbyId: generateUniqueId(),
        user,
      };

      await dispatch(lobbyEvent);

      return {
        lobbyId: lobbyEvent.lobbyId,
        errors: [],
      };
    },

    async leave({ userId, lobbyId }) {
      const lobbyEvent: ILobbyEvent = {
        eventId: generateUniqueId(),
        type: "USER_LEFTED_LOBBY",
        lobbyId,
        userId,
      };

      await dispatch(lobbyEvent);

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

    onLobbyStatesChanged({ lobbyId }, set) {
      const q = query(
        collection(firestore, "lobbyStates"),
        where(`lobbyId`, "==", lobbyId)
      );

      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as ILobbyState);

        set(data);
      });
    },
  };
};
