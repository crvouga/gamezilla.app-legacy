import { Google } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import React from "react";
import { useAppDispatch } from "../../app-store";
import * as Account from "./account-state";

const Login = ({ loading }: { loading?: boolean }) => {
  const dispatch = useAppDispatch();

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        p: 2,
      }}
    >
      <Typography variant="h3" color="primary.main" sx={{ marginBottom: 2 }}>
        Gamezilla
      </Typography>

      <LoadingButton
        variant="contained"
        size="large"
        fullWidth
        startIcon={<Google />}
        loading={loading}
        onClick={() => {
          dispatch(Account.Actions.login({ method: "google" }));
        }}
      >
        Continue With Google
      </LoadingButton>
    </Box>
  );
};

export default Login;
