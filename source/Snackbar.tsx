import { Snackbar } from "@mui/material";
import { react } from "Framework";
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

export type Snack = { type: "Info"; message: string };

export const init: Model = { queue: [] };

//
//
//
// Update
//
//
//

export type Msg = { type: "Enqueue"; snack: Snack };

export const update = (msg: Msg, model: Model): Model => {
  switch (msg.type) {
    case "Enqueue":
      return { ...model, queue: [...model.queue, msg.snack] };
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
    <Snackbar open message="Hello" />;
