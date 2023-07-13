import { GameSpace } from "@gamezilla/shared/app";
import { Ok } from "@gamezilla/shared/core";
import { GameSpaceDb } from "./game-space-db";

export const makeGameSpaceDb = (): GameSpaceDb => {
  const db = new Map<string, GameSpace>();

  const zap: GameSpaceDb["zap"] = async (spaceId) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    db.delete(spaceId);
    return Ok(null);
  };

  const set: GameSpaceDb["set"] = async (space) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    db.set(space.gameSpaceId, space);
    return Ok(null);
  };

  const get: GameSpaceDb["get"] = async (spaceId) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const space = db.get(spaceId);
    return Ok(space ?? null);
  };

  const getByUserId: GameSpaceDb["getByUserId"] = async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const space = db.get(userId);
    return Ok(space ?? null);
  };

  return {
    get,
    getByUserId,
    set,
    zap,
  };
};
