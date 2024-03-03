import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  clickedPeopleButton,
  init,
  clickedUser,
  changeRoute,
  createCtx,
  clickedUserPreviewLink,
} from "../@TEST/client.ts"
import { UserId } from "../../../@SHARED/data/user-id.ts"
import { Modals } from "./modals.tsx"
import { SpaceClientModule } from "../architecture/architecture.tsx"
import { openUserDetails } from "../@SHARED/space-client-cmd.ts"
import { didPushRoute } from "gamezilla-app/@CHILD/app/@SHARED/client/client-cmd.ts"

describe(import.meta.file, () => {
  it("should start with no modals open", async () => {
    const ctx = createCtx()
    const output = await AppClientModule.andThen(init(ctx))
    expect(output.model.modal === null).toBeTrue()
  })

  it("should open users modal when user clicks on users button", async () => {
    const ctx = createCtx()
    const output = await AppClientModule.andThen(
      init(ctx),
      clickedPeopleButton(ctx),
      //
    )
    expect(output.model.modal === "users").toBeTrue()
  })

  it("should open user details modal after clicking user", async () => {
    const ctx = createCtx()

    const someUserId = UserId.generate()

    const output = await AppClientModule.andThen(
      init(ctx),
      clickedUser(ctx, someUserId),
    )
    expect(
      output.model.modal === "user-preview" &&
        output.model.modalPreviewUserId === someUserId,
    ).toBeTrue()
  })

  it("should close modal when the current route changes", async () => {
    const someUserId = UserId.generate()
    const ctx = createCtx()
    const output = await AppClientModule.andThen(
      init(ctx),
      clickedUser(ctx, someUserId),
      changeRoute(ctx, { t: "spaces", c: { t: "space-list" } }),
    )
    expect(output.model.modal === null).toBeTrue()
  })

  it("should open user details corresponding cmd", async () => {
    const ctx = createCtx()
    const someUserId = UserId.generate()

    const output = await SpaceClientModule.andThen(init(ctx), (model) =>
      Modals.update({
        model,
        ctx,
        msgCmd: openUserDetails(someUserId),
      }),
    )
    expect(
      output.model.modal === "user-preview" &&
        output.model.modalPreviewUserId === someUserId,
    ).toBeTrue()
  })

  it("should navigate to preview users profile page when clicked", async () => {
    const ctx = createCtx()
    const someUserId = UserId.generate()
    const output = await SpaceClientModule.andThen(
      init(ctx),
      clickedUser(ctx, someUserId),
      clickedUserPreviewLink(ctx),
    )

    expect(
      didPushRoute(output, {
        t: "profile",
        c: { t: "profile", userId: someUserId },
      }),
    ).toBeTrue()
  })

  it("should play sound when clicking preview user link", async () => {
    const ctx = createCtx()
    const someUserId = UserId.generate()
    const output = await SpaceClientModule.andThen(
      init(ctx),
      clickedUser(ctx, someUserId),
      clickedUserPreviewLink(ctx),
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) => msgCmd.t === "sound" && msgCmd.c.t === "play",
      ),
    ).toBeTrue()
  })

  it("should not navigate after clicking preview user link if preview is not open", async () => {
    const ctx = createCtx()
    const someUserId = UserId.generate()
    const output = await SpaceClientModule.andThen(
      init(ctx),
      clickedUserPreviewLink(ctx),
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
