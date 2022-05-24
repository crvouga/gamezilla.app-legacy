import { Close } from "@mui/icons-material";
import { IconButton, Snackbar } from "@mui/material";
import { option, task } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { delay } from "fp-ts/lib/Task";
import { cmd, react } from "Framework";
import { Cmd } from "Framework/Cmd";
import { perform } from "Framework/Task";
import React from "react";

//
//
//
// Model
//
//
//

export type Model = {
  queue: Snack[];
  current:
    | {
        type: "Appearing";
        snack: Snack;
      }
    | {
        type: "Appeared";
        snack: Snack;
      }
    | {
        type: "Disappearing";
        snack: Snack;
      }
    | {
        type: "Disappeared";
      };
};

export type Snack = {
  type: "Info";
  snackId: string;
  message: string;
};

export const init: Model = {
  queue: [],
  current: { type: "Disappeared" },
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

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "EnqueuedSnackbar":
      return [
        { ...model, queue: [msg.snack, ...model.queue] },
        pipe(
          delay(4000)(task.of({})),
          perform(() => ({
            type: "SnackbarDurationElapsed",
            snackId: msg.snack.snackId,
          }))
        ),
      ];

    case "SnackbarDurationElapsed":
      return removeById(msg, model);

    case "UserClosedSnackbar":
      return removeById(msg, model);
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
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <>
        {model.queue[0] && (
          <Snackbar
            open={Boolean(model.queue[0])}
            message={model.queue[0].message}
            sx={{ color: "black" }}
            onClose={() =>
              dispatch({
                type: "UserClosedSnackbar",
                snackId: model.queue[0].snackId,
              })
            }
          />
        )}
      </>
    );
