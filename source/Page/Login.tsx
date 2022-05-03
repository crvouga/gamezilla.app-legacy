import { LoadingButton } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Session from "../Session";

/* 


Model


*/

export type Model = { type: "Idle" } | { type: "Loading" };

export const init = (): Model => {
  return { type: "Idle" };
};

/*


Update


*/

export type Msg = { type: "Login" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Login":
      return [{ type: "Loading" }, Session.login()];
  }
};

/* 


View


*/

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <Box
        sx={{
          position: "fixed",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Typography variant="h1" sx={{ marginBottom: 2 }}>
          Gamezilla
        </Typography>

        <LoadingButton
          variant="outlined"
          size="large"
          fullWidth
          loading={model.type === "Loading"}
          onClick={() => dispatch({ type: "Login" })}
        >
          Continue With Google
        </LoadingButton>
      </Box>
    );
