import type { BackendEvt } from '~/app/@/backend/evt'
import { SpaceEvt } from '../space/evt'

export type SpaceBackendEvt = BackendEvt | SpaceEvt
