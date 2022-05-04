import { ChevronRight } from "@mui/icons-material";
import {
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import * as React from "react";
import { react } from "./Framework";

export const viewField =
  <Msg,>({
    label,
    value,
    onClick,
  }: {
    label: string;
    value: string;
    onClick: () => void;
  }): react.Html<Msg> =>
  () => {
    return (
      <ListItemButton onClick={onClick}>
        <ListItemText
          primaryTypographyProps={{
            variant: "subtitle1",
            color: "text.secondary",
          }}
          primary={label}
          secondaryTypographyProps={{ variant: "h6", color: "text.primary" }}
          secondary={value}
        />
        <ListItemSecondaryAction>
          <ChevronRight />
        </ListItemSecondaryAction>
      </ListItemButton>
    );
  };
