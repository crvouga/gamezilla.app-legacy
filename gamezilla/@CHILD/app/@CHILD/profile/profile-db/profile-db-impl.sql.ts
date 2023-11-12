import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { ProfileDb } from "./profile-db";
import { err, ok, Result } from "gamezilla/@SHARED/core";
import {
  Profile,
  ProfileAvatar,
  UserId,
  Username,
} from "gamezilla/@CHILD/app/@SHARED/data";
import { Parsing as P } from "gamezilla/@SHARED/parsing";
import { ProfileCore } from "../profile.core";

type ProfileRow = {
  user_id: string;
  avatar_url: string;
  username: string;
  avatar_seed: string | null;
  avatar_style: string | null;
};

const toProfileRow = (x: unknown): ProfileRow | null => {
  if (
    P.obj(x) &&
    P.has(x, "user_id", P.str) &&
    P.has(x, "avatar_url", P.str) &&
    P.has(x, "username", P.str) &&
    P.has(x, "avatar_seed", P.or(P.nullish, P.str)) &&
    P.has(x, "avatar_style", P.or(P.nullish, P.str))
  ) {
    return {
      ...x,
      avatar_seed: x.avatar_seed ?? null,
      avatar_style: x.avatar_style ?? null,
    };
  }
  return null;
};

const fromProfileRow = (row: ProfileRow): Result<string, ProfileCore> => {
  if (!UserId.is(row.user_id)) {
    return err("invalid user_id");
  }

  if (!Username.is(row.username)) {
    return err("invalid username");
  }

  const avatarSeed = row.avatar_seed
    ? ProfileAvatar.toSeed(row.avatar_seed)
    : null;

  const avatarStyle = row.avatar_style
    ? ProfileAvatar.toStyle(row.avatar_style)
    : null;

  return ok({
    userId: row.user_id,
    avatarUrl: row.avatar_url,
    username: row.username,
    avatarSeed: avatarSeed,
    avatarStyle: avatarStyle,
  });
};

export const createProfileDb = ({
  dbConn,
}: {
  dbConn: DbConnSql;
}): ProfileDb => {
  return {
    findOneByUserId: async (userId) => {
      const sql = `
        SELECT
          user_id,
          username,
          avatar_url,
          avatar_seed,
          avatar_style
        FROM
          user_profile
        WHERE
          user_id = :user_id
      `;

      const queried = await dbConn.query(P.is(toProfileRow), sql, {
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
        P.is(toProfileRow),
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
