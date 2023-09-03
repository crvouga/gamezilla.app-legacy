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
  const Spaces = createInMemoryStore<SpaceId, Space<Game.ServerModel>>({
    maxEntryCount,
  });
  const IndexUserId = createInMemoryStore<UserId, SpaceId>({
    maxEntryCount,
  });

  return {
    init(now) {
      return {
        spaces: Spaces.init(now),
        indexUserId: IndexUserId.init(now),
      };
    },

    async get(now, instance, spaceId) {
      return Spaces.latest(-Infinity, now, instance.spaces, spaceId);
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

      const space = await Spaces.latest(
        -Infinity,
        now,
        instance.spaces,
        spaceId
      );

      return space;
    },

    async list(now, instance) {
      return Spaces.listLatest(-Infinity, now, instance.spaces);
    },

    async assoc(now, instance, space) {
      const prevSpace = await Spaces.latest(
        -Infinity,
        now,
        instance.spaces,
        space.spaceId
      );

      const spaces = await Spaces.assoc(
        now,
        instance.spaces,
        space.spaceId,
        space
      );

      const prevUserIds = prevSpace ? Object.values(prevSpace.users) : [];

      const dissocPrevUserId = await IndexUserId.dissocMany(
        now,
        instance.indexUserId,
        prevUserIds
      );

      const indexUserId = await IndexUserId.assocMany(
        now,
        dissocPrevUserId,
        Object.values(space.users).map((userId) => [userId, space.spaceId])
      );
      return {
        spaces,
        indexUserId,
      };
    },

    async dissoc(now, instance, spaceId) {
      const space = await Spaces.latest(
        -Infinity,
        now,
        instance.spaces,
        spaceId
      );
      if (!space) {
        return instance;
      }
      return {
        spaces: await Spaces.dissoc(now, instance.spaces, spaceId),
        indexUserId: await IndexUserId.dissocMany(
          now,
          instance.indexUserId,
          Object.values(space.users)
        ),
      };
    },
  };
};
