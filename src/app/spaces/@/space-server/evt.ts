import type { ServerEvt } from '~/app/@/server/server-evt'
import { SpaceEvt } from '../space/evt'

export type SpaceServerEvt = ServerEvt | SpaceEvt
