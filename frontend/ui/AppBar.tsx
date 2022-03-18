import React from "react";
import { ChevronLeft } from "@mui/icons-material";
import { IconButton } from "@mui/material";

export const BackButton = ({ to }: { to: string }) => {
  return (
    <IconButton edge="start" onClick={() => {}}>
      <ChevronLeft />
    </IconButton>
  );
};

export const AppBarBackButton = () => {
  return (
    <IconButton edge="start" onClick={() => {}}>
      <ChevronLeft />
    </IconButton>
  );
};
