import type { ServerEvt } from '~/app/@/server/evt'
import { SpaceEvt } from '../space/evt'

export type SpaceServerEvt = ServerEvt | SpaceEvt
