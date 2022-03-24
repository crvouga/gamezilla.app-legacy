import { Google } from "@mui/icons-material";
import { Box, Button, Dialog, Typography } from "@mui/material";
import React from "react";
import { LoadingDialog } from "../../../ui-components";
import { actions, IAction, IState } from "./sign-in-logic";

export const SignInView = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <LoadingDialog
        visible={state.type === "signing-in"}
        title="Signing in..."
      />

      <Dialog open={state.type === "idle"}>
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h3"
            align="center"
            sx={{ marginBottom: 2, paddingX: 4 }}
          >
            Gamezilla
          </Typography>

          <Button
            fullWidth
            startIcon={<Google />}
            variant="contained"
            onClick={() => {
              dispatch(actions.signIn({ type: "google" }));
            }}
          >
            Continue with Google
          </Button>
        </Box>
      </Dialog>
    </>
  );
};
