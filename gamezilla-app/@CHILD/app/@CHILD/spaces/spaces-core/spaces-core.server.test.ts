// import { describe, expect, it } from "bun:test"
// import * as SpacesServer from "./spaces-core.server"
// import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
// import { WithEventMeta, withId } from "../@SHARED/event"

// describe(import.meta.file, () => {
//   it("should work", async () => {
//     const spaceId = SpaceId.generate()
//     const before = SpacesServer.listSpaces({
//       limit: 1,
//       offset: 0,
//       where: {
//         spaceId,
//       },
//     })
//     const updated = await SpacesServer.update({
//       spaceEvent: withId({
//         t: "user-started-space",
//         spaceId: spaceId,
//         userId: UserId.generate(),
//       }),
//     })
//     const after = SpacesServer.listSpaces({
//       limit: 1,
//       offset: 0,
//       where: {
//         spaceId,
//       },
//     })
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
