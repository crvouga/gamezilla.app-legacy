import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import {
  clickedPeopleButton,
  init,
  clickedUser,
  changeRoute,
  ctx,
  clickedUserPreviewLink,
} from "../@TEST/client.ts"
import { UserId } from "../../../@SHARED/data/user-id.ts"
import { Modals } from "./modals.tsx"
import { SpaceClientModule } from "../architechure/space-client.tsx"
import { openUserDetails } from "../@SHARED/space-client-cmd.ts"
import { didPushRoute } from "gamezilla/@CHILD/app/@SHARED/client/client-cmd.ts"

describe("space client modals", () => {
  it("should start with no modals open", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
    )
    expect(output.model.modal === null).toBeTrue()
  })

  it("should open users modal when user clicks on users button", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      clickedPeopleButton,
      //
    )
    expect(output.model.modal === "users").toBeTrue()
  })

  it("should open user details modal after clicking user", async () => {
    const someUserId = UserId.generate()

    const output = await AppClientModule.chainUpdates(
      await init(),
      (model) => clickedUser(model, someUserId),
      //
    )
    expect(
      output.model.modal === "user-preview" &&
        output.model.modalPreviewUserId === someUserId,
    ).toBeTrue()
  })

  it("should close modal when the current route changes", async () => {
    const someUserId = UserId.generate()
    const output = await AppClientModule.chainUpdates(
      init(),
      (model) => clickedUser(model, someUserId),
      (model) => changeRoute(model, { t: "spaces", c: { t: "space-list" } }),
    )
    expect(output.model.modal === null).toBeTrue()
  })

  it("should open user details corresponding cmd", async () => {
    const someUserId = UserId.generate()
    const initial = await init()
    const output = await SpaceClientModule.chainUpdates(
      { model: initial.model },
      (model) =>
        Modals.update({ model, ctx, msgCmd: openUserDetails(someUserId) }),
    )
    expect(
      output.model.modal === "user-preview" &&
        output.model.modalPreviewUserId === someUserId,
    ).toBeTrue()
  })

  it("should navigate to preview users profile page when clicked", async () => {
    const someUserId = UserId.generate()
    const output = await SpaceClientModule.chainUpdates(
      init(),
      (model) => clickedUser(model, someUserId),
      clickedUserPreviewLink,
    )

    expect(
      didPushRoute(output, {
        t: "profile",
        c: { t: "profile", userId: someUserId },
      }),
    ).toBeTrue()
  })

  it("should play sound when clicking preview user link", async () => {
    const someUserId = UserId.generate()
    const output = await SpaceClientModule.chainUpdates(
      init(),
      (model) => clickedUser(model, someUserId),
      clickedUserPreviewLink,
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) => msgCmd.t === "sound" && msgCmd.c.t === "play",
      ),
    ).toBeTrue()
  })

  it("should not navigate after clicking preview user link if preview is not open", async () => {
    const someUserId = UserId.generate()
    const output = await SpaceClientModule.chainUpdates(
      init(),
      clickedUserPreviewLink,
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === "routing" &&
          msgCmd.c.t === "push" &&
          msgCmd.c.route.t === "profile" &&
          msgCmd.c.route.c.t === "profile" &&
          msgCmd.c.route.c.userId === someUserId,
      ),
    ).toBeFalse()
  })
})
