import { SpaceEventStore } from "../space.core";

export const makeSpaceEventDb = (): SpaceEventStore => {
  return {
    append: async () => {
      //
      return null;
    },
    get: async () => {
      //
      return [];
    },
    getSpaceIdByUserId: async () => {
      //
      return null;
    },
  };
};
