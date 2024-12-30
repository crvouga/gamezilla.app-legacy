import { SpaceServerCtx } from '../@/space-server/ctx'
import * as GameTypes from '../games/types'

export type GamesServerCtx = SpaceServerCtx & GameTypes.GameServerCtx
