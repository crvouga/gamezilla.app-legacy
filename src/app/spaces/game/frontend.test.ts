// import { describe, expect, it } from 'vitest'

// import { SpaceId } from '~/app/@/data/space-id'
// import { FixtureSpacesFrontend } from '../@/fixture/frontend'
// import { Spaces } from '../space/spaces'
// import { GameName } from './games/@/game-name'
// import { NonEmpty } from '~/@/array/non-empty'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { ExitGameCmd } from '../@/frontend/exit-game-cmd'

// const Fixture = async () => {
//   const f = await FixtureSpacesFrontend()

//   return {
//     ...f,
//   }
// }

// describe('Test', () => {
//   it('should play a sound after inputting a game', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'start-space.clicked-start-space-button',
//           spaceId,
//         },
//       },
//       {
//         msg: {
//           t: 'game.clicked-game-tile',
//           gameName: 'numberlink',
//         },
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   it('should be able to start game', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const gameNameExpected: GameName = 'numberlink'
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'start-space.clicked-start-space-button',
//           spaceId,
//         },
//       },
//       {
//         msg: {
//           t: 'game.clicked-game-tile',
//           gameName: gameNameExpected,
//         },
//       },
//     ])
//     const gameName = Spaces.toSpaceStarted(output.model.spaces, spaceId)?.game?.t
//     expect(gameName).toBe(gameNameExpected)
//   })

//   it('should exit game for corresponding cmd', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const outputs = f.updates(f.initial, [
//       { msg: { t: 'start-space.clicked-start-space-button', spaceId } },
//       { msg: { t: 'game.clicked-game-tile', gameName: 'numberlink' } },
//       { msgIn: ExitGameCmd.init() },
//     ])

//     const gameName = Spaces.toSpaceStarted(NonEmpty.last(outputs).model.spaces, spaceId)?.game?.t ?? null

//     expect(gameName).toBeNull()
//   })
// })
