import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ServerCtx } from "gamezilla/@CHILD/app/@SHARED/server";
import { SqlStore } from "gamezilla/@SHARED/immutable-store/immutable-store.sql";

const isObj = (x: unknown): x is object => typeof x === "object";

export const StoreUserIdBySessionId = ({ dbConn }: ServerCtx) => {
  return SqlStore<SessionId, UserId>({
    async executeSql(rawSql) {
      const rows = await dbConn.query(isObj, rawSql, {});
      if (rows.t === "err") {
        return [];
      }
      return rows.value;
    },
    keySpace: "auth/user-id-by-session-id",
    decodeValue: (encoded) => (UserId.is(encoded) ? encoded : null),
    encodeValue: (value) => value,
  });
};

export const StoreSessionIdByUserId = ({ dbConn }: ServerCtx) => {
  return SqlStore<UserId, SessionId>({
    async executeSql(rawSql) {
      const rows = await dbConn.query(isObj, rawSql, {});
      if (rows.t === "err") {
        return [];
      }
      return rows.value;
    },
    keySpace: "auth/session-id-by-user-id",
    decodeValue: (encoded) => (SessionId.is(encoded) ? encoded : null),
    encodeValue: (value) => value,
  });
};
