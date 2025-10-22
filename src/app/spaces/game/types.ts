import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import * as GameTypes from '../game/games/types'

export type GamesBackendCtxModule = SpaceBackendCtx & GameTypes.GameBackendCtxModule
