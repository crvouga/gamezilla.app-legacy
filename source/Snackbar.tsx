import * as View from "View"
import { SxProps } from "@mui/material"
import { Cmd, Task, Uuid, pipe } from "Core"

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

export type Snack = {
  type: "Info" | "Error"
  snackId: string
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

export type GroupedMsg = { group: "Snackbar" } & Msg

type Msg =
  | { type: "SnackbarDurationElapsed"; snackId: string }
  | { type: "UserClosedSnackbar"; snackId: string }

export const EnqueueSnackbar = (variant: "Info" | "Error", message: string) => {
  return {
    group: "Snackbar",
    type: "EnqueuedSnackbar",
    snack: {
      type: variant,
      message,
      snackId: Uuid.generateSync(),
    },
  } as const
}

export type EnqueueSnackbar = ReturnType<typeof EnqueueSnackbar>

export type Action = EnqueueSnackbar

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "SnackbarDurationElapsed":
      return removeById(msg, model)

    case "UserClosedSnackbar":
      return [model, Cmd.none]
  }
}

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "EnqueuedSnackbar":
      const { snack } = action
      return [
        { ...model, queue: [snack, ...model.queue] },
        pipe(
          Task.timeout(4000, {}),
          Cmd.fromTask(() => ({
            type: "SnackbarDurationElapsed",
            snackId: snack.snackId,
          })),
        ),
      ]
  }
}

const removeById = (
  { snackId }: { snackId: string },
  model: Model,
): [Model, Cmd.Cmd<Msg>] => [
  {
    ...model,
    queue: model.queue.filter((snack) => snack.snackId !== snackId),
  },
  Cmd.none,
]

//
//
//
// View
//
//
//

export const view =
  ({ sx }: { sx?: SxProps }, model: Model): View.View<Msg> =>
  (dispatch) => {
    const snack = model.queue[0]

    if (!snack) {
      return <></>
    }

    return (
      <View.Portal>
        <View.Snackbar
          sx={sx}
          open
          message={snack.message}
          onClose={() =>
            dispatch({
              type: "UserClosedSnackbar",
              snackId: snack.snackId,
            })
          }
        >
          <View.Alert
            variant="filled"
            onClose={() =>
              dispatch({
                type: "UserClosedSnackbar",
                snackId: snack.snackId,
              })
            }
            severity={snack.type === "Error" ? "error" : "info"}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </View.Alert>
        </View.Snackbar>
      </View.Portal>
    )
  }
