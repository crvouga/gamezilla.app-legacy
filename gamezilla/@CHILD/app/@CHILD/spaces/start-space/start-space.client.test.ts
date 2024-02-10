import { describe, expect, test } from "bun:test"
import { didPlaySound, didPushRoute } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"
import { AppClientModule } from "../../../@SHARED/architecture/app-client"
import { clickedStartSpaceButton, ctx, init } from "../@TEST/client"
import { Spaces } from "../spaces-core"

describe("start space client", () => {
    test("current user starting space", async () => {
        const spaceId = SpaceId.generate()

        const started = await AppClientModule.chainUpdates(
            await init(),
            //
            (model) => clickedStartSpaceButton(model, spaceId),
        )

        expect(
            Spaces.toSpaceIdByUserId(started.model, ctx.currentUserId),
        ).toEqual(spaceId)
    })

    test("redirecting when starting a space", async () => {
        const spaceId = SpaceId.generate()

        const started = await AppClientModule.chainUpdates(
            await init(),
            //
            (model) => clickedStartSpaceButton(model, spaceId),
        )

        expect(
            didPushRoute(started, { t: "spaces", c: { t: "space", spaceId } }),
        ).toBeTrue()
    })

    test("should play sound after starting space", async () => {
        const started = await AppClientModule.chainUpdates(
            await init(),
            //
            (model) => clickedStartSpaceButton(model, SpaceId.generate()),
        )

        expect(didPlaySound(started)).toBeTrue()
    })
})
