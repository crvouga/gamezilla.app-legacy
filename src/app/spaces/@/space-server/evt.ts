import type { BackendEvt } from '~/app/@/server/evt'
import { SpaceEvt } from '../space/evt'

export type SpaceBackendEvt = BackendEvt | SpaceEvt
