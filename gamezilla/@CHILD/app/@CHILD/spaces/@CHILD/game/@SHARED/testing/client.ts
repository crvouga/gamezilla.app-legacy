import {
  ProfileAvatar,
  SpaceId,
  UserId,
  Username,
} from "gamezilla/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla/@SHARED/core"
import { SpaceClientCtx } from "../../../../@SHARED/space"

const currentUserId = "test-user-id" as UserId

const currentSpaceId = "test-space-id" as SpaceId

export const testSpaceClientCtx = (): SpaceClientCtx => {
  return {
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
}
