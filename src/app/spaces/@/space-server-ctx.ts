import { AppServerCtx } from '~/app/@/server/server-ctx'
import { SpaceCtx } from './space-ctx'

export type SpaceServerCtx = AppServerCtx & SpaceCtx
