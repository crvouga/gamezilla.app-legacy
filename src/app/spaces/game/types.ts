import { SpaceServerCtx } from '~/app/spaces/@/space-server/ctx'
import * as GameTypes from '../game/games/types'

export type GamesServerCtx = SpaceServerCtx & GameTypes.GameServerCtx
