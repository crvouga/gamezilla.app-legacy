import { Cmd } from "../../Core"
import * as Route from "../../Route"
import * as UI from "../../UI"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: Model = {}

//
//
//
// Update
//
//
//

export type Msg = ["ClickedBack"]

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedBack":
      return [model, Route.back]
  }
}
//
//
//
// View
//
//
//

export const view =
  (_model: Model): UI.View<Msg> =>
  (dispatch) =>
    (
      <UI.FillBox>
        <UI.Header
          left={
            <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
          }
          title="Chess"
        />
      </UI.FillBox>
    )

export const theme = {
  lightSquare: "#EBEBD0",
  darkSquare: "#779455",
}

export const CoverArt = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 2 2"
    >
      <rect
        x={0}
        y={0}
        width={1}
        height={1}
        fill={theme.lightSquare}
      />

      <rect
        x={0}
        y={1}
        width={1}
        height={1}
        fill={theme.darkSquare}
      />

      <rect
        x={1}
        y={1}
        width={1}
        height={1}
        fill={theme.lightSquare}
      />

      <rect
        x={1}
        y={0}
        width={1}
        height={1}
        fill={theme.darkSquare}
      />
    </svg>
  )
}
