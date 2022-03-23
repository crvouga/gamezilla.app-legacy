import { Avatar, Box, Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AppBar } from "../../../ui-components";
import { ProfileAvatarForm } from "./profile-avatar-form";
import {
  IAvatarSeed,
  IAvatarStyle,
  toAvatarSeed,
  toAvatarUrl,
} from "./profile-data";

export const ProfileCreateForm = ({
  userId,
  defaultName,
  onCancel,
  onCreate,
}: {
  userId: string;
  defaultName: string;
  onCreate: (values: {
    avatarUrl: string;
    username: string;
    name: string;
  }) => void;
  onCancel: () => void;
}) => {
  const isCreating = false;

  const [name, setName] = useState(defaultName);
  const [username, setUsername] = useState(
    name.replace(" ", "").toLowerCase() ?? ""
  );
  const [avatarSeed, setAvatarSeed] = useState<IAvatarSeed>(
    toAvatarSeed(username)
  );
  const [avatarStyle, setAvatarStyle] =
    useState<IAvatarStyle>("pixel-art-neutral");

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
            <AppBar title="Create Profile" />

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
                onChange={(event) => setName(event.currentTarget.value)}
              />

              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
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
                  onCreate({
                    avatarUrl,
                    name,
                    username,
                  });
                }}
              >
                Create
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
            onDone={(values) => {
              setAvatarSeed(values.avatarSeed);
              setAvatarStyle(values.avatarStyle);
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
