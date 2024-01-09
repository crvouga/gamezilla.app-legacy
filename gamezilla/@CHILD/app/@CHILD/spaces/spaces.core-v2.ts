import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import * as Space from "./spaces.core/space";

//
//
//
//
//
//

export type CoreModel = {
  spaces: {
    [spaceId: SpaceId]: Space.Model;
  };
  spaceIdByUserId: {
    [userId: UserId]: SpaceId;
  };
};

export const init: CoreModel = {
  spaces: {},
  spaceIdByUserId: {},
};

//
//
//
//
//
//
