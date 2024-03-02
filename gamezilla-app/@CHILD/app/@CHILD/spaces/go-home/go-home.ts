import {
  APP_SOUND,
  playSound,
  pushRoute,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { SpaceClientModule } from "../architecture/architecture"

const update: SpaceClientModule["update"] = ({ msg, model }) => {
  switch (msg?.t) {
    case "clicked-go-home-button": {
      return {
        model,
        msgCmd: [
          pushRoute({ t: "spaces", c: { t: "space-list" } }),
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
