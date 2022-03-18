import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { generateRandomAvatarSeed, toAvatarUrl } from "./profile-data";
import * as Profile from "./profile-state";

const ProfileCreate = ({
  userId,
  defaultName,
}: {
  userId: string;
  defaultName: string;
}) => {
  const isCreating = false;

  const [name, setName] = useState(defaultName);
  const [username, setUsername] = useState(
    name.replace(" ", "").toLowerCase() ?? ""
  );

  const onCreate = () => {
    // dispatch(
    //   Profile.Actions.create({
    //     userId,
    //     name,
    //     username,
    //     avatarUrl: toAvatarUrl("croodles-neutral", generateRandomAvatarSeed()),
    //   })
    // );
  };

  const onCancel = () => {};

  const back = () => {};

  switch ("1") {
    case "1":
      return (
        <Layout
          title="Create Profile"
          backButtonProps={{
            children: "Cancel",
            onClick: onCancel,
          }}
          nextButtonProps={{
            children: "Next",
            onClick: () => {},
          }}
        >
          <TextField
            sx={{ marginBottom: 2 }}
            value={name}
            onChange={(event) => {
              setName(event.currentTarget.value);
            }}
            label="Name"
          />
        </Layout>
      );

    default:
      return (
        <Layout
          title="Create Profile"
          backButtonProps={{
            children: "Back",
            onClick: back,
          }}
          nextButtonProps={{
            children: "Done",
            loading: isCreating,
            onClick: onCreate,
          }}
        >
          <TextField
            sx={{ marginBottom: 2 }}
            value={username}
            onChange={(event) => {
              setUsername(event.currentTarget.value);
            }}
            label="Username"
          />
        </Layout>
      );
  }
};

const Layout = ({
  children,
  title,
  backButtonProps,
  nextButtonProps,
}: {
  title: string;
  backButtonProps?: LoadingButtonProps;
  nextButtonProps?: LoadingButtonProps;
  children: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          p: 2,
          flex: 1,
        }}
      >
        {children}
      </Box>

      <Box sx={{ display: "flex", p: 2 }}>
        <Button
          variant="outlined"
          sx={{ flex: 1, marginRight: 2 }}
          {...backButtonProps}
        />
        <LoadingButton
          sx={{ flex: 1 }}
          fullWidth
          variant="contained"
          size="large"
          type="submit"
          {...nextButtonProps}
        />
      </Box>
    </Box>
  );
};

export default ProfileCreate;
