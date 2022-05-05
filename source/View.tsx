import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  BoxProps,
  Box,
  IconButton,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import * as React from "react";

export const Field = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) => (
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

export const Header = ({
  left,
  title,
  right,
}: {
  left?: React.ReactNode;
  title: React.ReactNode;
  right?: React.ReactNode;
}) => {
  return (
    <Toolbar>
      <Box sx={{ flex: 1 }}>{left}</Box>

      <Typography sx={{ flex: 2 }} align="center" variant="h6">
        {title}
      </Typography>

      <Box sx={{ flex: 1 }}>{right}</Box>
    </Toolbar>
  );
};

export const HeaderBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton edge="start" onClick={onClick}>
      <ChevronLeft />
    </IconButton>
  );
};

export const Page = ({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: BoxProps["sx"];
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
