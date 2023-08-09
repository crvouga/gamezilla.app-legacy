import { Ok } from "@gamezilla/core";
import { GameSpace } from "@gamezilla/shared/game-space";
import { ServerModel } from "../game/game.core";
import { GameSpaceDb } from "./game-space-db";
import { GameSpaceId } from "@gamezilla/shared/app";

const TIMEOUT = 1;

export const makeGameSpaceDb = (): GameSpaceDb => {
  const db = new Map<GameSpaceId, GameSpace<ServerModel>>();

  const zap: GameSpaceDb["zap"] = async (spaceId) => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    db.delete(spaceId);
    return Ok(null);
  };

  const set: GameSpaceDb["set"] = async (space) => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    db.set(space.gameSpaceId, space);
    return Ok(null);
  };

  const get: GameSpaceDb["get"] = async (spaceId) => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    const space = db.get(spaceId);
    return Ok(space ?? null);
  };

  const getByUserId: GameSpaceDb["getByUserId"] = async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    for (const space of db.values()) {
      if (space.users[userId]) {
        return Ok(space);
      }
    }
    return Ok(null);
  };

  const getAll: GameSpaceDb["getAll"] = async () => {
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
