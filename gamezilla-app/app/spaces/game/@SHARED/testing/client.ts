import { getTranslator } from "gamezilla-app/app/@shared/client/translator"
import {
  ProfileAvatar,
  SpaceId,
  UserId,
  Username,
} from "gamezilla-app/app/@shared/data"
import { Posix } from "gamezilla-app/@shared/core"
import { SpaceClientCtx } from "../../../@shared/space"

const currentUserId = "test-user-id" as UserId

const currentSpaceId = "test-space-id" as SpaceId

export async function testSpaceClientCtx(): Promise<SpaceClientCtx> {
  return {
    navigatorLanguage: "en",
    t: getTranslator("en"),
    currentRoute: {
      n: "spaces",
      t: "space",
      spaceId: currentSpaceId,
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
        username: await Username.generate(),
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
