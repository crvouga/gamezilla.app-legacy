import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { FlowPuzzleListClient } from "../../../../@SHARED/flow-puzzle-list"
import { ClientModule } from "../../builder.core"
import { PuzzleCreateClient } from "../create/puzzle-create.client"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates({ model: input.model }, (model) =>
    updatePuzzleList({ ...input, model }),
  )
}

const updatePuzzleList: ClientModule["update"] = (input) => {
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
