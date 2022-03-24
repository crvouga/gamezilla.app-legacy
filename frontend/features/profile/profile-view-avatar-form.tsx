import {
  Avatar,
  Box,
  Button,
  FormControl,
  InputLabel,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { AppBar } from "../../ui-components";
import {
  ALL_AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  toAvatarSeed,
  toAvatarStyle,
  toAvatarUrl,
} from "./profile-avatar-data";

export const ProfileAvatarForm = ({
  defaultValues,
  onCancel,
  onDone,
}: {
  defaultValues: {
    avatarSeed: IAvatarSeed;
    avatarStyle: IAvatarStyle;
  };
  onCancel: () => void;
  onDone: (values: {
    avatarSeed: IAvatarSeed;
    avatarStyle: IAvatarStyle;
  }) => void;
}) => {
  const [avatarSeed, setAvatarSeed] = useState<IAvatarSeed>(
    defaultValues.avatarSeed
  );
  const [avatarStyle, setAvatarStyle] = useState<IAvatarStyle>(
    defaultValues.avatarStyle
  );

  const avatarUrl = toAvatarUrl({
    avatarSeed,
    avatarStyle,
  });

  const [age, setAge] = useState("");

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AppBar title="Avatar" />

      <Avatar
        src={avatarUrl}
        sx={{
          width: "144px",
          height: "144px",
          margin: "auto",
          marginBottom: 4,
        }}
      />

      <Box sx={{ paddingX: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="avatar-style-select-label">Avatar Style</InputLabel>

          <Select
            sx={{ marginBottom: 4 }}
            labelId="avatar-style-select-label"
            id="avatar-style-select"
            fullWidth
            value={avatarStyle}
            label="Avatar Style"
            onChange={(event) => {
              setAvatarStyle(toAvatarStyle(event.target.value));
            }}
            renderValue={(avatarStyle) => {
              return (
                <Box sx={{ display: "flex" }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{ width: "2rem", height: "2rem" }}
                      src={toAvatarUrl({ avatarStyle, avatarSeed })}
                    />
                  </ListItemAvatar>
                  <ListItemText>{formatAvatarStyle(avatarStyle)}</ListItemText>
                </Box>
              );
            }}
          >
            {ALL_AVATAR_STYLES.map((avatarStyle) => (
              <MenuItem key={avatarStyle} value={avatarStyle}>
                <ListItemAvatar>
                  <Avatar src={toAvatarUrl({ avatarStyle, avatarSeed })} />
                </ListItemAvatar>
                <ListItemText>{formatAvatarStyle(avatarStyle)}</ListItemText>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Avatar Seed"
          fullWidth
          value={avatarSeed}
          onChange={(event) => {
            setAvatarSeed(toAvatarSeed(event.target.value));
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
            onDone({ avatarSeed, avatarStyle });
          }}
        >
          Done
        </Button>
      </Box>
    </Box>
  );
};
