import { SpaceServerCtx } from '../@/space-server-ctx'
import * as GameTypes from './game.types'

export type GamesServerCtx = SpaceServerCtx & GameTypes.GameServerCtx
