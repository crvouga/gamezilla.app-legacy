import {
  APP_SOUND,
  playSound,
  pushRoute,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { SpaceClientModule } from "../architecture/architecture"
import { SpacesRoutes } from "../@SHARED/space-routes"

const update: SpaceClientModule["update"] = ({ msg, model }) => {
  switch (msg?.t) {
    case "clicked-go-home-button": {
      return {
        model,
        msgCmd: [
          pushRoute(SpacesRoutes.SpaceList()),
          playSound(APP_SOUND.navBackwardMin),
        ],
      }
    }
    default: {
      return { model }
    }
  }
}

export const GoHome = {
  update,
}
