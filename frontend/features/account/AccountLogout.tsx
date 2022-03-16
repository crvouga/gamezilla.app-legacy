import { LoadingButton } from "@mui/lab";
import { Box, Button, Drawer, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app-store";
import * as Account from "./account-state";

const Logout = () => {
  const isLoggingOut = useAppSelector(
    (state) => state.account.type === "logging-out"
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <Drawer open anchor="bottom" onBackdropClick={onCancel}>
      <Typography sx={{ p: 2 }} align="center" variant="h5">
        Logout of Gamezilla?
      </Typography>

      <Box
        sx={{
          width: "100%",
          p: 2,
          display: "flex",
        }}
      >
        <Button
          variant="outlined"
          sx={{ flex: 1, marginRight: 2 }}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <LoadingButton
          sx={{ flex: 1 }}
          variant="contained"
          loading={isLoggingOut}
          size="large"
          onClick={() => {
            dispatch({
              namespace: "account",
              type: Account.ActionType.Logout,
            });
          }}
        >
          Logout
        </LoadingButton>
      </Box>
    </Drawer>
  );
};

export default Logout;
