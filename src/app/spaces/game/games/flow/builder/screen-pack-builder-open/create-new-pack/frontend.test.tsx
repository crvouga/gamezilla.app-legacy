import { describe, expect, it } from 'bun:test'
import { didPlaySound, didShowToast } from '~/app/@/frontend/cmd'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import {
  clickedPackCreateNewButton,
  createPack,
  FixtureFlowBuilderFrontend,
  initial,
  testFlowFrontendCtx,
  userCreatedPack,
} from '../../@/fixture/frontend'

export const Fixture = async () => {
  const f = await FixtureFlowBuilderFrontend()
  return { ...f }
}

describe(import.meta.file, () => {
  it('should make a sound when the user clicks the create button', async () => {
    const ctx = await testFlowFrontendCtx()

    const output = GameFrontendModule.andThen(initial, clickedPackCreateNewButton(ctx))

    expect(didPlaySound(output)).toBe(true)
  })

  it('should play a sound after user created a pack', async () => {
    const ctx = await testFlowFrontendCtx()
    const pack = await createPack(ctx)
    const output = GameFrontendModule.andThen(initial, userCreatedPack(ctx, pack))

    expect(didPlaySound(output)).toBe(true)
  })

  it('should show toast after backend created current users pack', async () => {
    const ctx = await testFlowFrontendCtx()
    const pack = await createPack(ctx)
    const output = GameFrontendModule.andThen(initial, userCreatedPack(ctx, pack))
    expect(didShowToast(output)).toBe(true)
  })
})
