import { SpaceId, UserId } from "gamezilla-app/app/@shared/data"
import { pipe } from "gamezilla-app/@shared/core"
import { withId } from "../event"
import { Space } from "../../spaces-core"

export const makeSpace = (spaceId: SpaceId, hostId: UserId) => {
  return pipe(
    Space.init,
    //
    (model) =>
      Space.appendEvent({
        model,
        event: withId({
          t: "user-started-space",
          spaceId: spaceId,
          userId: hostId,
        }),
      }),

    (model) =>
      Space.appendEvent({
        model,
        event: withId({
          t: "user-inputted-game",
          spaceId: spaceId,
          userId: hostId,
          game: "connect-four",
        }),
      }),
  )
}
