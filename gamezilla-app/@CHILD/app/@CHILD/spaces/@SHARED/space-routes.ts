import { Namespace } from "gamezilla-app/@SHARED/msg"
import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"

const Msg = Namespace("spaces")

export const SpacesRoutes = {
  SpaceList: Msg("space-list"),
  Space: Msg<{ spaceId: SpaceId }>("space"),
}
