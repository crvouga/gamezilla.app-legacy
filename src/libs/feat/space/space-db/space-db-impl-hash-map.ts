import { Space } from "@gamezilla/shared/app";
import { Ok } from "@gamezilla/shared/core";
import { SpaceDb } from "./space-db";

const db = new Map<string, Space>();

const zap: SpaceDb["zap"] = async (spaceId) => {
  db.delete(spaceId);
  return Ok(null);
};

const get: SpaceDb["get"] = async (spaceId) => {
  const space = db.get(spaceId);
  return Ok(space ?? null);
};

const set: SpaceDb["set"] = async (space) => {
  db.set(space.spaceId, space);
  return Ok(null);
};

export const spaceDb: SpaceDb = {
  get,
  set,
  zap,
};
