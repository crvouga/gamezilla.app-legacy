import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { ISessionDb } from "./session-db";
import { SessionDbInMemory } from "./session-db-impl.in-memory";
import { SessionDbPostgres } from "./session-db-impl.postgres";

export type Impl =
  | {
      t: "in-memory";
    }
  | {
      t: "postgres";
      dbConn: DbConnSql;
    };

export const SessionDb = (impl: Impl): ISessionDb => {
  switch (impl.t) {
    case "in-memory": {
      return SessionDbInMemory();
    }

    case "postgres": {
      return SessionDbPostgres({ dbConn: impl.dbConn });
    }
  }
};
