import React from "react";
import { ChevronLeft } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const BackButton = ({ to }: { to: string }) => {
  const navigate = useNavigate();
  return (
    <IconButton
      edge="start"
      onClick={() => {
        navigate(to, { replace: true });
      }}
    >
      <ChevronLeft />
    </IconButton>
  );
};

export const AppBarBackButton = () => {
  const navigate = useNavigate();
  return (
    <IconButton
      edge="start"
      onClick={() => {
        navigate(-1);
      }}
    >
      <ChevronLeft />
    </IconButton>
  );
};
