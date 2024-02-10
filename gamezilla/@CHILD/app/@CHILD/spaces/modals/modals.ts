import { pushRoute } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceClientModule } from "../architechure/space-client"

const update: SpaceClientModule["update"] = ({ msg, msgEvt, model }) => {
  switch (msgEvt?.t) {
    case "routing/route-changed": {
      return { model: { ...model, modal: null } }
    }
  }

  switch (msg?.t) {
    case "closed-modal": {
      return { model: { ...model, modal: null } }
    }

    case "clicked-people-button": {
      return { model: { ...model, modal: "users" } }
    }

    case "clicked-user": {
      return {
        model: {
          ...model,
          modalPreviewUserId: msg.userId,
          modal: "user-preview",
        },
      }
    }

    case "clicked-link": {
      return {
        model,
        msgCmd: [pushRoute(msg.route)],
      }
    }
  }

  return { model }
}

export const Modals = {
  update,
}
