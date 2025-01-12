import { AppBackendCtx } from '~/app/@/backend/ctx'
import { SpaceCtx } from '../space/ctx'

export type SpaceBackendCtx = AppBackendCtx & SpaceCtx
