import {
  IconDeleteForever,
  ListItemButton,
} from "gamezilla-app/@CHILD/app/@SHARED/ui"
import { ClientModule } from "../../../create.core"

const ViewListItem: ClientModule["View"] = (input) => {
  const { modelSync } = input

  if (!modelSync.packBuilder) {
    return null
  }

  if (modelSync.packBuilder.screen.t !== "screen-puzzle") {
    return null
  }

  return (
    <>
      <ListItemButton
        icon={(props) => <IconDeleteForever {...props} />}
        label="Remove from pack"
        color="danger"
      />
    </>
  )
}

const update: ClientModule["update"] = (input) => {
  const { model } = input

  return { model }
}

export const RemoveFromPackClient = {
  update,
  ViewListItem,
}
