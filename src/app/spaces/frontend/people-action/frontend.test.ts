// import { describe, expect, it, test } from 'vitest'
// import { UserId } from '~/app/@/data/user-id'
// import { APP_SOUND } from '~/app/@/frontend/app-sound'
// import { OpenProfileCmd } from '~/app/@/frontend/open-profile-cmd.$msg'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { ScreenChangedEvt } from '~/app/@/frontend/screen-changed-evt.$msg'
// import { FixtureSpacesFrontend } from '../../@/fixture/frontend'
// import { OpenUserDetailsCmd } from '../../@/frontend/open-user-details-cmd'
// import { PeopleActionFrontend } from './frontend'

// const Fixture = async () => {
//   const f = await FixtureSpacesFrontend()
//   return {
//     ...f,
//   }
// }

// describe('Test', () => {
//   it('should start with no modals open', async () => {
//     const f = await Fixture()
//     const output = f.update(f.initial, [])
//     expect(output.model.opened === null).toBe(true)
//   })

//   it('should open users modal when user clicks on users button', async () => {
//     const f = await Fixture()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'people-action.clicked-people-action',
//         },
//       },
//     ])
//     expect(output.model.opened === 'people.people-surface').toBe(true)
//   })

//   it('should open user details modal after clicking user', async () => {
//     const f = await Fixture()
//     const someUserId = UserId.generate()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'people-action.clicked-person-list-item',
//           userId: someUserId,
//         },
//       },
//     ])
//     expect(
//       output.model.opened === 'people.person-preview-surface' && output.model.openedPreviewUserId === someUserId,
//     ).toBe(true)
//   })

//   it('should close modal when the current screen changes', async () => {
//     const f = await Fixture()
//     const someUserId = UserId.generate()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'people-action.clicked-person-list-item',
//           userId: someUserId,
//         },
//       },
//       {
//         msgIn: ScreenChangedEvt.init({
//           n: 'spaces',
//           t: 'space-list',
//         }),
//       },
//     ])
//     expect(output.model.opened === null).toBe(true)
//   })

//   it('should open user details corresponding cmd', async () => {
//     const f = await Fixture()

//     const someUserId = UserId.generate()

//     const output = PeopleActionFrontend.update({
//       model: f.initial.model,
//       ctx: f.ctx,
//       msgIn: OpenUserDetailsCmd.init(someUserId),
//     })

//     expect(
//       output.model.opened === 'people.person-preview-surface' && output.model.openedPreviewUserId === someUserId,
//     ).toBe(true)
//   })

//   it('should navigate to preview users profile page when clicked', async () => {
//     const f = await FixtureSpacesFrontend()
//     const someUserId = UserId.generate()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'people-action.clicked-person-list-item',
//           userId: someUserId,
//         },
//       },
//       {
//         msg: {
//           t: 'people-action.clicked-preview-user-link',
//         },
//       },
//     ])

//     expect(OpenProfileCmd.did(output, someUserId)).toBe(true)
//   })

//   it('should play sound when clicking preview user link', async () => {
//     const f = await FixtureSpacesFrontend()
//     const someUserId = UserId.generate()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'people-action.clicked-person-list-item',
//           userId: someUserId,
//         },
//       },
//       {
//         msg: {
//           t: 'people-action.clicked-preview-user-link',
//         },
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   it('should not navigate after clicking preview user link if preview is not open', async () => {
//     const f = await FixtureSpacesFrontend()
//     const someUserId = UserId.generate()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'people-action.clicked-preview-user-link',
//         },
//       },
//     ])
//     expect(OpenProfileCmd.did(output, someUserId)).toBe(false)
//   })

//   test('play sound open people modal', async () => {
//     const f = await FixtureSpacesFrontend()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'people-action.clicked-people-action',
//         },
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('play sound close modal', async () => {
//     const f = await FixtureSpacesFrontend()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'people-action.closed-surface',
//         },
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('play sound open user details modal', async () => {
//     const f = await FixtureSpacesFrontend()
//     const someUserId = UserId.generate()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'people-action.clicked-person-list-item',
//           userId: someUserId,
//         },
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('should toggle people modal when clicking button', async () => {
//     const f = await FixtureSpacesFrontend()
//     const before = f.update(f.initial, [{ msg: { t: 'people-action.clicked-people-action' } }])
//     const after = f.update(before, [{ msg: { t: 'people-action.clicked-people-action' } }])
//     expect(before.model.opened === 'people.people-surface').toBe(true)
//     expect(after.model.opened === null).toBe(true)
//   })

//   test('should play drawer sounds when toggling people modal', async () => {
//     const f = await FixtureSpacesFrontend()
//     const openOutput = f.update(f.initial, [{ msg: { t: 'people-action.clicked-people-action' } }])
//     const closeOutput = f.update(openOutput, [{ msg: { t: 'people-action.clicked-people-action' } }])
//     expect(PlaySoundCmd.did(openOutput, APP_SOUND.surfaceOpened)).toBe(true)
//     expect(PlaySoundCmd.did(closeOutput, APP_SOUND.surfaceClosed)).toBe(true)
//   })

//   test('should play close sound when closing the people surface', async () => {
//     const f = await FixtureSpacesFrontend()
//     const output = f.update(f.initial, [
//       {
//         msg: { t: 'people-action.closed-surface' },
//       },
//     ])
//     expect(PlaySoundCmd.did(output, APP_SOUND.surfaceClosed)).toBe(true)
//   })
// })
