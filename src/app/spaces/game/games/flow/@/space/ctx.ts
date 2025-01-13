import { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { Solutions } from '../solutions/solutions'

export type FlowSpaceCtx = SpaceCtx & {
  solutions: Solutions
}
