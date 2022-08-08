import { SxProps } from "@mui/material"
import * as UI from "./UI"
import { Cmd, pipe, Task, Time, Uuid } from "./Core"

//
//
//
// Model
//
//
//

export type Model = {
  queue: Snack[]
}

type SnackId = string

export type Snack = {
  variant: "Info" | "Error"
  snackId: SnackId
  message: string
}

export const init: Model = {
  queue: [],
}

//
//
//
// Update
//
//
//

export type Msg =
  | ["DurationElapsed", SnackId]
  | ["ClickedClose", SnackId]
  | ["ClickedAwayClose", SnackId]

export type Enqueue = [
  "Enqueue",
  { variant: "Info" | "Error"; message: string },
]

export type Action = ["Snackbar", Enqueue]

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "DurationElapsed":
      return removeById(msg[1], model)

    case "ClickedClose":
      return removeById(msg[1], model)

    case "ClickedAwayClose":
      return [model, Cmd.None]
  }
}

const snackTimeout = 4000

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action[1][0]) {
    case "Enqueue": {
      const { message, variant } = action[1][1]

      const snack: Snack = {
        snackId: Uuid.generateSync(),
        message,
        variant,
      }

      return [
        {
          ...model,
          queue: [snack, ...model.queue],
        },
        Time.startTimeout(snack.snackId, snackTimeout, [
          "DurationElapsed",
          snack.snackId,
        ]),
      ]
    }
  }
}

const removeById = (snackId: string, model: Model): [Model, Cmd.Cmd<Msg>] => [
  {
    ...model,
    queue: model.queue.filter((snack) => snack.snackId !== snackId),
  },
  Time.cancelTimeout(snackId),
]

//
//
//
// View
//
//
//

export const view =
  ({ sx }: { sx?: SxProps }, model: Model): UI.View<Msg> =>
  (dispatch) => {
    const snack = model.queue[0]

    if (!snack) {
      return <></>
    }

    return (
      <UI.Portal>
        <UI.Snackbar
          sx={sx}
          open
          message={snack.message}
          onClose={() => dispatch(["ClickedAwayClose", snack.snackId])}
        >
          <UI.Alert
            variant="filled"
            onClose={() => dispatch(["ClickedClose", snack.snackId])}
            severity={snack.variant === "Error" ? "error" : "info"}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </UI.Alert>
        </UI.Snackbar>
      </UI.Portal>
    )
  }
