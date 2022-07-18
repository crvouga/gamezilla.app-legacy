import { SxProps } from "@mui/material";
import * as UI from "./UI";
import { Cmd, Task, Uuid, pipe } from "./Core";

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

export type Msg =
  | ["SnackbarDurationElapsed", string]
  | ["UserClosedSnackbar", string];

export const EnqueueSnackbar = (variant: "Info" | "Error", message: string) => {
  return {
    group: "Snackbar",
    type: "EnqueuedSnackbar",
    snack: {
      type: variant,
      message,
      snackId: Uuid.generateSync(),
    },
  } as const;
};

export type EnqueueSnackbar = ReturnType<typeof EnqueueSnackbar>;

export type Action = EnqueueSnackbar;

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "SnackbarDurationElapsed":
      return removeById(msg[1], model);

    case "UserClosedSnackbar":
      return [model, Cmd.None];
  }
};

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "EnqueuedSnackbar":
      const { snack } = action;
      return [
        { ...model, queue: [snack, ...model.queue] },
        pipe(
          Task.timeout(4000, {}),
          Cmd.fromTask((): Msg => ["SnackbarDurationElapsed", snack.snackId]),
        ),
      ];
  }
};

const removeById = (snackId: string, model: Model): [Model, Cmd.Cmd<Msg>] => [
  {
    ...model,
    queue: model.queue.filter((snack) => snack.snackId !== snackId),
  },
  Cmd.None,
];

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
    const snack = model.queue[0];

    if (!snack) {
      return <></>;
    }

    return (
      <UI.Portal>
        <UI.Snackbar
          sx={sx}
          open
          message={snack.message}
          onClose={() => dispatch(["UserClosedSnackbar", snack.snackId])}
        >
          <UI.Alert
            variant="filled"
            onClose={() => dispatch(["UserClosedSnackbar", snack.snackId])}
            severity={snack.type === "Error" ? "error" : "info"}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </UI.Alert>
        </UI.Snackbar>
      </UI.Portal>
    );
  };
