import {
  ProfileAvatar,
  SpaceId,
  UserId,
  Username,
} from "gamezilla/@CHILD/app/@SHARED/data"
import { SpaceClientCtx } from "../../../../@SHARED/space"
import { Posix } from "gamezilla/@SHARED/core"

const currentUserId = UserId.generate()

const currentSpaceId = SpaceId.generate()

export const spaceClientCtx: SpaceClientCtx = {
  currentRoute: {
    t: "spaces",
    c: {
      t: "space",
      spaceId: currentSpaceId,
    },
  },
  currentUserId,
  documentVisibilityState: "visible",
  now: Posix.now(),
  profiles: {
    [currentUserId]: {
      avatarUrl: ProfileAvatar.toUrl({
        seed: ProfileAvatar.generateRandomSeed(),
        style: "fun-emoji",
      }),
      userId: currentUserId,
      username: Username.generate(),
    },
  },
  space: {
    hostId: currentUserId,
    spaceId: currentSpaceId,
    users: {
      [currentUserId]: currentUserId,
    },
    visibility: "public",
  },
}
