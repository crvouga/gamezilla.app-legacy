// import { describe, expect, it } from "bun:test"
// import * as SpacesServer from "./spaces-core.server"
// import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
// import { WithEventMeta, withId } from "../@SHARED/event"

// const Fixture = async () => {
//   return {
//     spaceId: SpaceId.generate(),
//     userId: UserId.generate(),
//     spaceEvent: withId({
//       t: "user-started-space",
//       spaceId: SpaceId.generate(),
//       userId: UserId.generate(),
//     }),
//   }
// }

// describe(import.meta.file, () => {
//   it("should work", async () => {
//     const spaceId = SpaceId.generate()
//     const f = Fixture()
//     const before = await SpacesServer.getSpaceById(spaceId)
//     const updated = await SpacesServer.update({
//       spaceEvent: withId({
//         t: "user-started-space",
//         spaceId: spaceId,
//         userId: UserId.generate(),
//       }),
//     })
//     const after = await SpacesServer.getSpaceById(spaceId)

//     expect(before).toEqual([])
//     expect(updated).toBeTruthy()
//     // expect(after).toEqual([
//     //   {
//     //     spaceId,
//     //     users: [],
//     //   },
//     // ])
//   })
// })
