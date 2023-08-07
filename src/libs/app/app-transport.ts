import { SessionId } from "@gamezilla/core";
import { ToClient, ToServer } from "./app.core";

export type ServerToClientEvents = {
  ["to-client"]: (msg: ToClient) => void;
  ["session-id"]: (sessionId: SessionId) => void;
};

export type ClientToServerEvents = {
  ["to-server"]: (msg: ToServer) => void;
};

export const SESSION_ID_KEY = "gamezilla-session-id";
