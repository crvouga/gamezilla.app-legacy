import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { ProfileDb } from "./profile-db";
import { err, ok, Result, has, is, isObj, str } from "gamezilla/@SHARED/core";
import { Profile, UserId, Username } from "gamezilla/@CHILD/app/@SHARED/data";

type ProfileRow = {
  user_id: string;
  avatar_url: string;
  username: string;
};

/*
CREATE TABLE user_profile (
  user_id VARCHAR(255) PRIMARY KEY,
  avatar_url VARCHAR(255),
  username VARCHAR(255) UNIQUE,
  INDEX idx_username (username)
)
*/

const toProfileRow = (x: unknown): ProfileRow | null => {
  if (
    isObj(x) &&
    has(x, "user_id", str) &&
    has(x, "avatar_url", str) &&
    has(x, "username", str)
  ) {
    return x;
  }
  return null;
};

const fromProfileRow = (row: ProfileRow): Result<string, Profile> => {
  if (!UserId.is(row.user_id)) {
    return err("invalid user_id");
  }

  if (!Username.is(row.username)) {
    return err("invalid username");
  }

  return ok({
    userId: row.user_id,
    avatarUrl: row.avatar_url,
    username: row.username,
  });
};

export const createProfileDb = ({
  dbConn,
}: {
  dbConn: DbConnSql;
}): ProfileDb => {
  return {
    findOneByUserId: async (userId) => {
      const sql = `SELECT user_id, username, avatar_url FROM user_profile WHERE user_id = :user_id`;

      const queried = await dbConn.query(is(toProfileRow), sql, {
        user_id: userId,
      });

      if (queried.t === "err") {
        return queried;
      }

      const parsed = Result.combine(queried.value.map(fromProfileRow));

      if (parsed.t === "err") {
        return parsed;
      }

      return ok(parsed.value);
    },
    insertOne: async (profile) => {
      const inserted = await dbConn.query(
        is(toProfileRow),
        `
        INSERT INTO user_profile (user_id, username, avatar_url)
        VALUES (:user_id, :username, :avatar_url)
        `,
        {
          user_id: profile.userId,
          username: profile.username,
          avatar_url: profile.avatarUrl,
        }
      );

      if (inserted.t === "err") {
        return inserted;
      }

      return ok(null);
    },
  };
};
