import { Ok, Sub } from "gamezilla/@SHARED/core";
import { Space } from "gamezilla/app/space/@SHARED";
import { ServerModel } from "../game/game.core";
import { SpaceId } from "gamezilla/app/@SHARED/data";
import { SpaceDb, SpaceDbMsg } from "./space-db";

const TIMEOUT = 1;

export const makeSpaceDb = (): SpaceDb => {
  const db = new Map<SpaceId, Space<ServerModel>>();

  const zap: SpaceDb["zap"] = async (spaceId) => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    db.delete(spaceId);
    sub.publish({ t: "zap", spaceId });
    return Ok(null);
  };

  const set: SpaceDb["set"] = async (space) => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    db.set(space.spaceId, space);
    sub.publish({ t: "set", space });
    return Ok(null);
  };

  const get: SpaceDb["get"] = async (spaceId) => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    const space = db.get(spaceId);
    return Ok(space ?? null);
  };

  const getByUserId: SpaceDb["getByUserId"] = async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    for (const space of db.values()) {
      if (space.users[userId]) {
        return Ok(space);
      }
    }
    return Ok(null);
  };

  const getAll: SpaceDb["getAll"] = async () => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    return Ok(Array.from(db.values()));
  };

  const sub = Sub.create<SpaceDbMsg>();

  return {
    get,
    getAll,
    getByUserId,
    set,
    zap,
    sub,
  };
};
