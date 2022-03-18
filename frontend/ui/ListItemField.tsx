import { ChevronRight } from "@mui/icons-material";
import {
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import React from "react";

export const ListItemField = ({
  label,
  value,
  to,
}: {
  to: string;
  label: string;
  value?: string;
}) => {
  return (
    <ListItemButton>
      <ListItemText
        primaryTypographyProps={{
          variant: "body2",
          color: "text.secondary",
        }}
        primary={label}
        secondaryTypographyProps={{
          variant: "body1",
          color: value ? "text.primary" : "text.disabled",
        }}
        secondary={value ?? label}
      />
      <ListItemSecondaryAction>
        <ChevronRight />
      </ListItemSecondaryAction>
    </ListItemButton>
  );
};
