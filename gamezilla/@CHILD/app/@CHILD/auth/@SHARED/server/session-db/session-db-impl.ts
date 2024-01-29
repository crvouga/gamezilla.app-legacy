import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { ISessionDb } from "./session-db";
import { SessionDbInMemory } from "./session-db-impl.in-memory";

export type Impl =
  | {
      t: "in-memory";
    }
  | {
      t: "postgres";
      dbConn: DbConnSql;
    };

export const SessionDb = (impl: Impl = { t: "in-memory" }): ISessionDb => {
  switch (impl.t) {
    case "in-memory": {
      return SessionDbInMemory();
    }

    case "postgres": {
      return SessionDbInMemory();
    }
  }
};
