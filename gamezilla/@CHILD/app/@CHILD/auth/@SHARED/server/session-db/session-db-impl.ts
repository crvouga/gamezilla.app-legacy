import { ISessionDb } from "./session-db";
import { SessionDbInMemory } from "./session-db-impl.in-memory";

export const SessionDb = (): ISessionDb => {
  return SessionDbInMemory();
};
