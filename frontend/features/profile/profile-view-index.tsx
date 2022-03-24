import { ChevronLeft, ChevronRight, Delete, Edit } from "@mui/icons-material";
import {
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import React from "react";
import { AppBar } from "../../ui-components";

type INavigateAction =
  | {
      type: "edit";
    }
  | {
      type: "delete";
    }
  | {
      type: "back";
    };

export const ProfileView = ({
  navigate,
}: {
  navigate: (action: INavigateAction) => void;
}) => {
  return (
    <>
      <AppBar
        start={[
          <IconButton
            sx={{ marginLeft: -1 }}
            onClick={() => {
              navigate({ type: "back" });
            }}
          >
            <ChevronLeft />
          </IconButton>,
        ]}
        title="Profile"
      />

      <List>
        <ListItemButton
          onClick={() => {
            navigate({ type: "edit" });
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
            navigate({ type: "delete" });
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
