import { createInMemoryStore } from "gamezilla/@SHARED/core";
import { SpaceStore } from "./space-store";
import { SpaceId, UserId } from "gamezilla/app/@SHARED/data";
import { Space } from "../@SHARED";
import * as Game from "../game/game.core";

export const createSpaceStoreInMemory = ({
  maxEntryCount,
}: {
  /**
   * The maximum number of entries to keep in the store.
   * If this is infinite then the store will grow without bound but will be purely functional and immutable.
   */
  maxEntryCount: number;
}): SpaceStore => {
  const Space = createInMemoryStore<SpaceId, Space<Game.ServerModel>>({
    maxEntryCount,
  });
  const IndexUserId = createInMemoryStore<UserId, SpaceId>({
    maxEntryCount,
  });

  return {
    toJSON() {
      return {
        spaces: Space.toJSON(),
        indexUserId: IndexUserId.toJSON(),
      };
    },
    init(now) {
      return {
        spaces: Space.init(now),
        indexUserId: IndexUserId.init(now),
      };
    },

    async get(now, instance, spaceId) {
      return Space.latest(-Infinity, now, instance.spaces, spaceId);
    },

    async getByUserId(now, instance, userId) {
      const spaceId = await IndexUserId.latest(
        -Infinity,
        now,
        instance.indexUserId,
        userId
      );

      if (!spaceId) {
        return undefined;
      }

      const space = await Space.latest(
        -Infinity,
        now,
        instance.spaces,
        spaceId
      );

      return space;
    },

    async list(now, instance) {
      return Space.list(-Infinity, now, instance.spaces);
    },

    async assoc(now, instance, space) {
      const spaces = await Space.assoc(
        now,
        instance.spaces,
        space.spaceId,
        space
      );

      const indexUserId = await IndexUserId.assocMany(
        now,
        instance.indexUserId,
        Object.values(space.users).map((userId) => [userId, space.spaceId])
      );

      return {
        spaces,
        indexUserId,
      };
    },

    async dissoc(now, instance, spaceId) {
      const space = await Space.latest(
        -Infinity,
        now,
        instance.spaces,
        spaceId
      );
      if (!space) {
        return instance;
      }
      return {
        spaces: await Space.dissoc(now, instance.spaces, spaceId),
        indexUserId: await IndexUserId.dissocMany(
          now,
          instance.indexUserId,
          Object.values(space.users)
        ),
      };
    },
  };
};
