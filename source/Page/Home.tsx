import React from "react";
import { Avatar, Box, Toolbar, Typography } from "@mui/material";
import { react } from "elm-ts";
import { LoadingButton } from "@mui/lab";

export const view =
  <Msg,>(): react.Html<Msg> =>
  () =>
    (
      <Box
        sx={{
          position: "fixed",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Gamezilla
          </Typography>
          <Avatar />
        </Toolbar>
        <Box sx={{ p: 2 }}>
          <LoadingButton fullWidth>Delete Profile</LoadingButton>
        </Box>
      </Box>
    );
