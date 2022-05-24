import { Snackbar } from "@mui/material";
import { task } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { delay } from "fp-ts/lib/Task";
import { cmd, react } from "Framework";
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
};

export type Snack = { type: "Info"; message: string; snackId: string };

export const init: Model = { queue: [] };

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "Enqueue"; snack: Snack }
  | { type: "Dequeue"; snackId: string };

export const Enqueue = ({ message }: { message: string }): Msg => {
  return {
    type: "Enqueue",
    snack: {
      type: "Info",
      message,
      snackId: String(Math.random()),
    },
  };
};

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  console.log(msg, model);
  switch (msg.type) {
    case "Enqueue":
      return [
        { ...model, queue: [...model.queue, msg.snack] },
        pipe(
          delay(1000)(task.of({})),
          perform(() => ({ type: "Dequeue", snackId: msg.snack.snackId }))
        ),
      ];

    case "Dequeue":
      return [
        {
          ...model,
          queue: model.queue.filter((snack) => snack.snackId !== msg.snackId),
        },
        cmd.none,
      ];
  }
};

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
        {model.queue.map((snack) => (
          <Snackbar open key={snack.message} message={snack.message} />
        ))}
      </>
    );
