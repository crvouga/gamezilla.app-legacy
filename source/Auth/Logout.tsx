import * as Auth from "./Auth"
import { Cmd } from "../Core"
import * as Route from "../Route"
import * as UI from "../UI"

//
//
//
// Model
//
//
//

export type Model = { type: "Idle" } | { type: "LoggingOut" }

export const init: Model = { type: "Idle" }

//
//
//
// Update
//
//
//

export type Msg = ["ClickedCancel"] | ["ClickedBackdrop"] | ["ClickedLogout"]

type OutAction = Auth.Action

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedCancel":
      return [model, Route.back, []]

    case "ClickedBackdrop":
      return [model, Route.back, []]

    case "ClickedLogout":
      return [{ type: "LoggingOut" }, Cmd.None, [["Auth", ["Logout"]]]]
  }
}

//
//
//
// View
//
//
//

export const View = ({
  model,
  dispatch,
}: {
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  switch (model.type) {
    case "Idle": {
      return (
        <UI.ConformationDialog
          open={model.type === "Idle"}
          title="Logout of Gamezilla?"
          confirmTitle="Logout"
          onConfirm={() => dispatch(["ClickedLogout"])}
          onClose={() => dispatch(["ClickedBackdrop"])}
          onCancel={() => dispatch(["ClickedCancel"])}
        />
      )
    }

    case "LoggingOut": {
      return (
        <UI.LoadingDialog
          open={model.type === "LoggingOut"}
          title={"Logging out..."}
        />
      )
    }
  }
}
