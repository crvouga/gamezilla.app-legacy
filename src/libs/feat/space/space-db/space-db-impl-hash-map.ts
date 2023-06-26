import { Space } from "@gamezilla/shared/app";
import { Ok } from "@gamezilla/shared/core";
import { SpaceDb } from "./space-db";

const db = new Map<string, Space>();

const zap: SpaceDb["zap"] = async (spaceId) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  db.delete(spaceId);
  return Ok(null);
};

const set: SpaceDb["set"] = async (space) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  db.set(space.spaceId, space);
  return Ok(null);
};

const get: SpaceDb["get"] = async (spaceId) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  const space = db.get(spaceId);
  return Ok(space ?? null);
};

const getByUserId: SpaceDb["getByUserId"] = async (userId) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  const space = db.get(userId);
  return Ok(space ?? null);
};

export const spaceDb: SpaceDb = {
  get,
  getByUserId,
  set,
  zap,
};
