import { describe, expect, it } from 'bun:test'
import { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import { didPlaySound, didShowToast } from '~/app/@/client'
import {
  clickedPackCreateNewButton,
  createFlowPack,
  FixtureFlowBuilderClient,
  initial,
  testFlowClientCtx,
  userCreatedPack
} from '../../@/testing/client'

export const Fixture = () => {
  const f = FixtureFlowBuilderClient()
  return { ...f }
}

describe(import.meta.file, () => {
  it('should make a sound when the user clicks the create button', async () => {
    const ctx = await testFlowClientCtx()

    const output = GameClientModule.andThen(initial, clickedPackCreateNewButton(ctx))

    expect(didPlaySound(output)).toBe(true)
  })

  it('should play a sound after user created a pack', async () => {
    const ctx = await testFlowClientCtx()
    const pack = await createFlowPack(ctx)
    const output = GameClientModule.andThen(initial, userCreatedPack(ctx, pack))

    expect(didPlaySound(output)).toBe(true)
  })

  it('should show toast after server created current users pack', async () => {
    const ctx = await testFlowClientCtx()
    const pack = await createFlowPack(ctx)
    const output = GameClientModule.andThen(initial, userCreatedPack(ctx, pack))
    expect(didShowToast(output)).toBe(true)
  })
})
