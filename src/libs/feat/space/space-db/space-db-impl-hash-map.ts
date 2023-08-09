import { Ok } from "@gamezilla/core";
import { Space } from "src/libs/feat/space/shared";
import { ServerModel } from "../game/game.core";
import { SpaceId } from "../space-id";
import { SpaceDb } from "./space-db";

const TIMEOUT = 1;

export const makeSpaceDb = (): SpaceDb => {
  const db = new Map<SpaceId, Space<ServerModel>>();

  const zap: SpaceDb["zap"] = async (spaceId) => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    db.delete(spaceId);
    return Ok(null);
  };

  const set: SpaceDb["set"] = async (space) => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    db.set(space.spaceId, space);
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

  return {
    get,
    getAll,
    getByUserId,
    set,
    zap,
  };
};
