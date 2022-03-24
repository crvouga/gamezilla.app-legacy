import { ChevronRight, Delete, Edit } from "@mui/icons-material";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import React from "react";
import { AppBar, LoadingDialog } from "../../ui-components";
import {
  parseAvatarUrl,
  toAvatarSeed,
  toAvatarUrl,
} from "./profile-avatar-data";
import { IAction, IState, actions, IFoundState } from "./profile-logic";
import { ProfileForm } from "./profile-view-form";

export const ProfileCreateView = ({
  onCancel,
  defaultName,
  dispatch,
}: {
  onCancel: () => void;
  defaultName: string;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <ProfileForm
      title="Create Profile"
      onCancel={onCancel}
      submitTitle="Create"
      onSubmit={(values) => {
        dispatch(
          actions.create({
            ...values,
            avatarUrl: toAvatarUrl(values),
          })
        );
      }}
      defaultValues={{
        name: defaultName,
        username: defaultName.replace(" ", "").toLocaleLowerCase(),
        avatarSeed: toAvatarSeed(defaultName),
        avatarStyle: "big-ears-neutral",
      }}
    />
  );
};

export const ProfileUpdateView = ({
  state,
  onCancel,
  dispatch,
}: {
  onCancel: () => void;
  state: IFoundState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <LoadingDialog
        visible={state.status === "updating"}
        title="Updating profile..."
      />

      <ProfileForm
        title="Edit Profile"
        defaultValues={{
          ...parseAvatarUrl(state.profile.avatarUrl),
          username: state.profile.username ?? "",
          name: state.profile.name ?? "",
        }}
        onCancel={onCancel}
        submitTitle="Update"
        onSubmit={(values) => {
          dispatch(
            actions.update({
              ...values,
              avatarUrl: toAvatarUrl(values),
            })
          );
        }}
      />
    </>
  );
};

export const ProfileView = ({
  emit,
}: {
  emit: (route: "edit" | "delete" | "back") => void;
}) => {
  return (
    <>
      <AppBar title="Profile" />
      <List>
        <ListItemButton
          onClick={() => {
            emit("edit");
          }}
        >
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText primary="Edit" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
        <ListItemButton
          onClick={() => {
            emit("delete");
          }}
        >
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText primary="Delete" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};
