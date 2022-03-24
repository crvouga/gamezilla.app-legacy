import { Avatar, Box, Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AppBar } from "../../ui-components";
import { ProfileAvatarForm } from "./profile-view-avatar-form";
import { IAvatarSeed, IAvatarStyle, toAvatarUrl } from "./profile-avatar-data";

type IValues = {
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
  username: string;
  name: string;
};

export const ProfileForm = ({
  defaultValues,
  onCancel,
  onSubmit,
  title,
  submitTitle,
}: {
  title: string;
  defaultValues: IValues;
  submitTitle: string;
  onSubmit: (values: IValues) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(defaultValues.name);
  const [username, setUsername] = useState(defaultValues.username);
  const [avatarSeed, setAvatarSeed] = useState(defaultValues.avatarSeed);
  const [avatarStyle, setAvatarStyle] = useState(defaultValues.avatarStyle);

  const avatarUrl = toAvatarUrl({ avatarSeed, avatarStyle });

  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Box
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <AppBar title={title} />

            <Box
              onClick={() => {
                navigate("avatar");
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Avatar
                src={avatarUrl}
                sx={{
                  width: "144px",
                  height: "144px",
                  marginBottom: 1,
                }}
              />
              <Button>Change Avatar</Button>
            </Box>

            <Box sx={{ paddingX: 2 }}>
              <TextField
                sx={{ marginBottom: 4 }}
                fullWidth
                label="Name"
                value={name}
                onChange={(event) => {
                  setName(event?.currentTarget?.value ?? "");
                }}
              />

              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(event) => {
                  setUsername(event?.currentTarget?.value ?? "");
                }}
              />
            </Box>

            <Box
              sx={{
                position: "absolute",
                top: "auto",
                bottom: "0",
                left: "auto",
                right: "0",
                padding: 2,
                width: "100%",
                display: "flex",
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                sx={{ marginRight: 2 }}
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  onSubmit({
                    avatarSeed,
                    avatarStyle,
                    name,
                    username,
                  });
                }}
              >
                {submitTitle}
              </Button>
            </Box>
          </Box>
        }
      />

      <Route
        path="avatar"
        element={
          <ProfileAvatarForm
            defaultValues={{
              avatarSeed,
              avatarStyle,
            }}
            onDone={(avatarValues) => {
              setAvatarSeed(avatarValues.avatarSeed);
              setAvatarStyle(avatarValues.avatarStyle);
              navigate(-1);
            }}
            onCancel={() => {
              navigate(-1);
            }}
          />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
