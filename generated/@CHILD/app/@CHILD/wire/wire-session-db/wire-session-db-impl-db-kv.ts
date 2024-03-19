import { DbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv";
import { Task, isOk } from "gamezilla-app/@SHARED/core";
import { P } from "gamezilla-app/@SHARED/parsing";
import { isClient } from "../wire.core";
import { IWireSessionDb } from "./wire-session-db";
import { SessionId } from "gamezilla-app/@CHILD/app/@SHARED/data";
export const WireSessionDbKv = ({ dbConnKv, }: {
    dbConnKv: DbConnKv;
}): IWireSessionDb => {
    const clientsKv = DbConnKv.instance(dbConnKv, ["wire-session-db", "clients-by-session-id"], isClient);
    const sessionIdsKv = DbConnKv.instance(dbConnKv, ["wire-session-db", "session-ids-by-user-id"], P.arr(SessionId.is));
    return {
        clients: {
            async findBySessionIds(sessionIds) {
                const got = await Promise.all(sessionIds.map((sessionId) => clientsKv.get(sessionId)));
                const clients = got.flatMap((x) => (isOk(x) ? x.value ?? [] : []));
                return Task.ok(clients);
            },
            async set(sessionId, client) {
                return Task.p(clientsKv.set(sessionId, client), () => Task.ok(null));
            },
        },
        sessionIds: {
            async findByUserIds(userIds) {
                const got = await Promise.all(userIds.map((userId) => sessionIdsKv.get(userId)));
                const sessionIds = got.flatMap((x) => (isOk(x) ? x.value ?? [] : []));
                return Task.ok(sessionIds);
            },
            async set(userId, sessionId) {
                return Task.p(sessionIdsKv.set(userId, sessionId), () => Task.ok(null));
            },
        },
    };
};
