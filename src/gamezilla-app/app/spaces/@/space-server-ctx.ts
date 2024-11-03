import { AppServerCtx } from 'gamezilla-app/app/@/server'
import { SpaceCtx } from './space-ctx'

export type SpaceServerCtx = AppServerCtx & SpaceCtx
