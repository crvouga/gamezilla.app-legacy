import { Eff } from '~/@/eff'
import type { WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'

//
//
//
//
//
//
//

export type GameBackendTypes = {
  //
  ModelBackend: any
  MsgBackend: any
  MsgToFrontend: any
  MsgToBackend: any
  //
  ModelSpace: any
  MsgSpace: any
  //
}

type Output<T extends GameBackendTypes> = {
  model: T['ModelBackend']
  msgSpace?: WithEventId<T['MsgSpace']>[]
  eff?: Eff<T['MsgBackend']>
}

export type GameBackend<T extends GameBackendTypes> = {
  init: (input: { ctx: SpaceBackendCtx; state: T['ModelSpace']; model?: T['ModelBackend'] | null }) => Promise<{
    model: T['ModelBackend']
    eff?: Eff<T['MsgBackend']>
  }>

  update: (input: {
    ctx: SpaceBackendCtx
    state: T['ModelSpace']
    model?: T['ModelBackend'] | null
    //
    msg?: T['MsgBackend'] | null
    frontendMsg?: T['MsgToBackend'] | null
    msgSpace?: WithEventMeta<T['MsgSpace']> | null
    msgEvt?: Record<string, unknown> | null
  }) => Promise<Output<T>>

  subscriptions: (input: {
    model?: T['ModelBackend'] | null
    intervalId: string
    ctx: SpaceBackendCtx
    state: T['ModelSpace']
  }) => Promise<Sub<T['MsgBackend']>>
}

export const GameBackend = {}
