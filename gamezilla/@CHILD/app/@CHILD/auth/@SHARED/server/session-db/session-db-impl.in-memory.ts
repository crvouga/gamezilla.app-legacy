import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ISessionDb } from "./session-db";
import { err } from "gamezilla/@SHARED/core";

export const SessionDbInMemory = (): ISessionDb => {
  return {
    async findSessionIdsByUserId(_userId: UserId) {
      return err("not implemented");
    },
    async findUserIdBySessionId(_sessionId: SessionId) {
      return err("not implemented");
    },
    async insert(_input) {
      return err("not implemented");
    },
    async deleteByUserId(_userId: UserId) {
      return err("not implemented");
    },
  };
};
