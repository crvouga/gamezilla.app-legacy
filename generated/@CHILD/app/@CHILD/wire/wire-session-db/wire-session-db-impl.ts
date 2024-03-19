import { DbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv";
import { IWireSessionDb } from "./wire-session-db";
import { WireSessionDbKv } from "./wire-session-db-impl-db-kv";
type Impl = {
    t: "db-conn-kv";
    dbConnKv: DbConnKv;
};
export const WireSessionDb = (impl: Impl): IWireSessionDb => {
    switch (impl.t) {
        case "db-conn-kv":
            return WireSessionDbKv(impl);
    }
};
