import { APP_SOUND, playSound } from "gamezilla-app/app/@SHARED/client"
import { GameClientModule } from "gamezilla-app/app/spaces/@SHARED/architecture/game-client-v2"
import { withId } from "gamezilla-app/app/spaces/@SHARED/event"
import { FlowPuzzleListClient } from "../../../@SHARED/flow-puzzle/flow-puzzle-list"
import { ClientModule } from "../../create.core"
import { PuzzleCreateClient } from "../create/puzzle-create.client"

const update: ClientModule["update"] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => updatePuzzleListItem({ ...input, model }),
    (model) => updateUserClickedListItem({ ...input, model }),
  )
}

const updatePuzzleListItem: ClientModule["update"] = (input) => {
  const { model, msg } = input

  switch (msg?.t) {
    case "puzzle-list.clicked-puzzle-list-item": {
      return {
        model,
        msgSync: [
          withId({
            t: "puzzle-list.clicked-puzzle-list-item",
            puzzle: msg.puzzle,
          }),
        ],
      }
    }
  }

  return { model }
}

const updateUserClickedListItem: ClientModule["update"] = (input) => {
  const { model, msgSync } = input

  switch (msgSync?.t) {
    case "puzzle-list.clicked-puzzle-list-item": {
      return {
        model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }
  }

  return { model }
}

const View: ClientModule["View"] = (input) => {
  const { model, dispatch } = input

  return (
    <FlowPuzzleListClient.View
      ctx={input.ctx}
      dispatch={(c) => input.dispatch({ t: "flow-puzzle-list", c })}
      model={model.flowPuzzleList}
      emits={{
        clickedPuzzleItem: (puzzle) =>
          dispatch({
            t: "puzzle-list.clicked-puzzle-list-item",
            puzzle,
          }),
      }}
      slots={{
        fab: () => <PuzzleCreateClient.ViewCreateButton {...input} />,
      }}
    />
  )
}

export const PuzzleListClient = {
  update,
  View,
}
