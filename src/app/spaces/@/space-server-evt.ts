import type { ServerEvt } from '~/app/@/server'
import { SpaceEvt } from './space-evt'

export type SpaceServerEvt = ServerEvt | SpaceEvt
