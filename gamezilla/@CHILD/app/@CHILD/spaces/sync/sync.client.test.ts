import { describe, expect, test } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { init, spaceSyncFromServer } from "../@TEST/client"
import { Space, Spaces } from "../spaces-core"
import { eq, p } from "gamezilla/@SHARED/core"
import { withId } from "../@SHARED/event"
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"

describe("sync client", () => {
  test("should merge space recieved from server", async () => {
    const someStartedSpace = p(
      Space.init,
      //
      (model) =>
        Space.appendEvent({
          model,
          msgEvt: withId({
            t: "user-started-space",
            spaceId: SpaceId.generate(),
            userId: UserId.generate(),
          }),
        }),
    )

    const updated = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => spaceSyncFromServer(model, someStartedSpace),
    )

    expect(
      Spaces.listSpaces({
        model: updated.model,
        offset: 0,
        limit: 1,
      }).some((space) => eq(space, someStartedSpace)),
    ).toBeTrue()
  })
})
