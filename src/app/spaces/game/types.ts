import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import * as GameTypes from '../game/games/types'

export type GamesBackendCtx = SpaceBackendCtx & GameTypes.GameBackendCtx
