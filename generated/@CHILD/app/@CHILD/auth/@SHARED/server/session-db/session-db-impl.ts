import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server";
import { ISessionDb } from "./session-db";
import { SessionDbInMemory } from "./session-db-impl.in-memory";
import { SessionDbPostgres } from "./session-db-impl.postgres";
import { SessionDbWithCache } from "./session-db-impl.with-hash-map-cache";
import { DbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv";
import { SessionDbWithDbKvCache } from "./session-db-impl.with-db-kv-cache";
export type Impl = {
    t: "in-memory";
    delay: () => Promise<void>;
} | {
    t: "postgres";
    dbConnSql: DbConnSql;
} | {
    t: "postgres-with-hash-map-cache";
    dbConnSql: DbConnSql;
} | {
    t: "postgres-with-db-kv-cache";
    dbConnSql: DbConnSql;
    dbConnKv: DbConnKv;
};
export const SessionDb = (impl: Impl): ISessionDb => {
    switch (impl.t) {
        case "in-memory": {
            return SessionDbInMemory(impl);
        }
        case "postgres": {
            return SessionDbPostgres(impl);
        }
        case "postgres-with-hash-map-cache": {
            return SessionDbWithCache({
                SessionDb: SessionDbPostgres(impl),
            });
        }
        case "postgres-with-db-kv-cache": {
            return SessionDbWithDbKvCache({
                SessionDb: SessionDbPostgres(impl),
                dbConnKv: impl.dbConnKv,
            });
        }
    }
};
