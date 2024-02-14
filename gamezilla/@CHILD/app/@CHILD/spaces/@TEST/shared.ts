import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { p } from "gamezilla/@SHARED/core"
import { withId } from "../@SHARED/event"
import { Space } from "../spaces-core"

export const makeSpace = (spaceId: SpaceId, hostId: UserId) => {
  return p(
    Space.init,
    //
    (model) =>
      Space.appendEvent({
        model,
        msgEvt: withId({
          t: "user-started-space",
          spaceId: spaceId,
          userId: hostId,
        }),
      }),

    (model) =>
      Space.appendEvent({
        model,
        msgEvt: withId({
          t: "user-inputted-game",
          spaceId: spaceId,
          userId: hostId,
          game: "connect-four",
        }),
      }),
  )
}
