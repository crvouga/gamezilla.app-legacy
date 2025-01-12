import { SpaceBackendCtx } from '~/app/spaces/@/space-server/ctx'
import * as GameTypes from '../game/games/types'

export type GamesBackendCtx = SpaceBackendCtx & GameTypes.GameBackendCtx
