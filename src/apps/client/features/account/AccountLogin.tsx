import { Google } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import React from "react";
import { useMutation } from "react-query";
import { login } from "./account-data-access";

const Login = () => {
  const mutation = useMutation(async (...params: Parameters<typeof login>) => {
    await login(...params);

    const NEVER_RESOLVE = new Promise(() => {});

    await NEVER_RESOLVE;
  });

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
        loading={mutation.status === "loading"}
        onClick={() => {
          mutation.mutate({ provider: "google" });
        }}
      >
        Continue With Google
      </LoadingButton>
    </Box>
  );
};

export default Login;
