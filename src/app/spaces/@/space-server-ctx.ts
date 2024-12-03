import { AppServerCtx } from 'app/@/server'
import { SpaceCtx } from './space-ctx'

export type SpaceServerCtx = AppServerCtx & SpaceCtx
