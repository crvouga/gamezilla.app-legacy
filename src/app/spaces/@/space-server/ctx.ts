import { AppBackendCtx } from '~/app/@/server/ctx'
import { SpaceCtx } from '../space/ctx'

export type SpaceBackendCtx = AppBackendCtx & SpaceCtx
