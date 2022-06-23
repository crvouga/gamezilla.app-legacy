import { SxProps } from "@mui/material";
import { task } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd } from "Core";
import { Cmd } from "Core/Cmd";
import { perform } from "Core/Task";
import * as View from "View";

//
//
//
// Model
//
//
//

export type Model = {
  queue: Snack[];
};

export type Snack = {
  type: "Info" | "Error";
  snackId: string;
  message: string;
};

export const init: Model = {
  queue: [],
};

//
//
//
// Update
//
//
//

export type GroupedMsg = { group: "Snackbar" } & Msg;

type Msg =
  | { type: "EnqueuedSnackbar"; snack: Snack }
  | { type: "SnackbarDurationElapsed"; snackId: string }
  | { type: "UserClosedSnackbar"; snackId: string };

export const EnqueuedSnackbar = (message: string): GroupedMsg => {
  return {
    group: "Snackbar",
    type: "EnqueuedSnackbar",
    snack: {
      type: "Info",
      message,
      snackId: String(Math.random()),
    },
  };
};

export const EnqueuedSnackbarError = (message: string): GroupedMsg => {
  return {
    group: "Snackbar",
    type: "EnqueuedSnackbar",
    snack: {
      type: "Error",
      message,
      snackId: String(Math.random()),
    },
  };
};

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "EnqueuedSnackbar":
      return [
        { ...model, queue: [msg.snack, ...model.queue] },
        pipe(
          task.delay(3000)(task.of({})),
          perform(() => ({
            type: "SnackbarDurationElapsed",
            snackId: msg.snack.snackId,
          }))
        ),
      ];

    case "SnackbarDurationElapsed":
      return removeById(msg, model);

    case "UserClosedSnackbar":
      return [model, cmd.none];
  }
};

const removeById = (
  { snackId }: { snackId: string },
  model: Model
): [Model, Cmd<Msg>] => [
  {
    ...model,
    queue: model.queue.filter((snack) => snack.snackId !== snackId),
  },
  cmd.none,
];

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
    const snack = model.queue[0];

    if (!snack) {
      return <></>;
    }

    return (
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
    );
  };
