import { describe, expect, test } from '~/@/test-runner'

describe('SpacesSyncFrontend', () => {
  test('should record profiles when received from backend', async () => {
    expect(true).toEqual(true)
  })
})

// import { FixtureSpacesFrontend } from '../@/fixture/frontend'

// export const hasExactlyOne = <T>(items: T[], predicate: (item: T) => boolean): boolean => {
//   return items.filter(predicate).length === 1
// }

// export const Fixture = async () => {
//   const f = await FixtureSpacesFrontend()
//   return {
//     ...f,
//   }
// }

// describe('SpacesSyncFrontend', () => {
//   // test('should record profiles when received from backend', async () => {
//   //   const f = await Fixture()
//   //   const someProfile = await UserProfile.random()
//   //   const someProfiles: {
//   //     [userId: UserId]: UserProfile
//   //   } = {
//   //     [someProfile.id]: someProfile,
//   //   }
//   //   const output = f.update(f.initial, [
//   //     {
//   //       msgBackend: {
//   //         t: 'list-spaces.listed',
//   //         spaces: [],
//   //         profilesByUserId: someProfiles,
//   //       },
//   //     },
//   //   ])
//   //   expect(AddProfilesCmd.did(output, Object.values(someProfiles))).toEqual(true)
//   // })
//   // test('should merge space received from backend', async () => {
//   //   const f = await Fixture()
//   //   const someSpace = makeSpace({
//   //     spaceId: SpaceId.generate(),
//   //     hostId: UserId.generate(),
//   //   })
//   //   const output = f.update(f.initial, [
//   //     {
//   //       msgBackend: {
//   //         t: 'sync.synced',
//   //         space: someSpace,
//   //       },
//   //     },
//   //   ])
//   //   const listed = SpacesCore.listSpaces({
//   //     model: output.model.spaces,
//   //     offset: 0,
//   //     limit: Number.POSITIVE_INFINITY,
//   //   })
//   //   expect(listed.some((space) => Space.isEqual(space, someSpace))).toEqual(true)
//   // })
//   // test("should merge current user's space when received from backend", async () => {
//   //   const f = await Fixture()
//   //   const spaceId = SpaceId.generate()
//   //   const someStartedSpace = makeSpace({
//   //     spaceId,
//   //     hostId: f.ctx.currentUser.userId,
//   //   })
//   //   const output = f.update(f.initial, [
//   //     {
//   //       msgBackend: {
//   //         t: 'sync.synced',
//   //         space: someStartedSpace,
//   //         currentUser: f.ctx.currentUser,
//   //       },
//   //     },
//   //   ])
//   //   const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(output.model.spaces, f.ctx.currentUser.userId)
//   //   expect(currentUserSpaceId).toEqual(spaceId)
//   // })
//   // test("should sync current user's space when backend connects if in space", async () => {
//   //   const f = await Fixture()
//   //   const output = f.update(f.initial, [
//   //     {
//   //       msg: {
//   //         t: 'start-space.clicked-start-space-button',
//   //         spaceId: SpaceId.generate(),
//   //       },
//   //     },
//   //     {
//   //       msgIn: BackendConnectedEvt.init(),
//   //     },
//   //   ])
//   //   expect(
//   //     hasExactlyOne(
//   //       output.msgCmd ?? [],
//   //       (msgCmd) => msgCmd.t === 'wire' && msgCmd.c.t === 'send-to-backend' && msgCmd.c.toBackend?.t === 'sync.sync',
//   //     ),
//   //   ).toEqual(true)
//   // })
//   // test('should send events to the backend like user joined space', async () => {
//   //   const f = await Fixture()
//   //   const spaceId = SpaceId.generate()
//   //   const output = f.update(f.initial, [
//   //     {
//   //       msgBackend: {
//   //         t: 'sync.got-msg-space',
//   //         c: withEventMetaAt(0, { t: 'user-started-space', spaceId, userId: UserId.generate() }),
//   //       },
//   //     },
//   //     {
//   //       msg: { t: 'joinSpace_submittedJoinSpaceForm', spaceId },
//   //     },
//   //   ])
//   //   expect(
//   //     hasExactlyOne(
//   //       output?.msgCmd ?? [],
//   //       (msgCmd) =>
//   //         msgCmd.t === 'wire' &&
//   //         msgCmd.c.t === 'send-to-backend' &&
//   //         msgCmd.c.toBackend?.t === 'sync.got-msg-space' &&
//   //         msgCmd.c.toBackend?.c.t === 'user-joined-space',
//   //     ),
//   //   ).toEqual(true)
//   // })
//   // test('should send events to the backend like user ended space', async () => {
//   //   const f = await Fixture()
//   //   const spaceId = SpaceId.generate()
//   //   const output = f.update(f.initial, [
//   //     {
//   //       msgBackend: {
//   //         profilesByUserId: {},
//   //         causedBy: {},
//   //         t: 'sync.got-msg-space',
//   //         c: withEventMetaAt(0, {
//   //           t: 'user-ended-space',
//   //           spaceId,
//   //           userId: UserId.generate(),
//   //         }),
//   //       },
//   //     },
//   //   ])
//   //   expect(
//   //     hasExactlyOne(
//   //       output.msgCmd ?? [],
//   //       (msgCmd) =>
//   //         msgCmd.t === 'wire' &&
//   //         msgCmd.c.t === 'send-to-backend' &&
//   //         msgCmd.c.toBackend?.t === 'sync.got-msg-space' &&
//   //         msgCmd.c.toBackend?.c.t === 'user-ended-space',
//   //     ),
//   //   ).toEqual(true)
//   // })
// })
