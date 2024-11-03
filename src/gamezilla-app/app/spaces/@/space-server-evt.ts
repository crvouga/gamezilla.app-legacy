import type { ServerEvt } from 'gamezilla-app/app/@/server'
import { SpaceEvt } from './space-evt'

export type SpaceServerEvt = ServerEvt | SpaceEvt
