import { ArrowBack, Clear } from "@mui/icons-material";
import { AppBar, IconButton, InputBase, Toolbar } from "@mui/material";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

export const GameInvitePage = () => {
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleBack = () => {
    navigate(-1);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <InputBase
            ref={inputRef}
            autoFocus
            sx={{ flex: 1 }}
            placeholder="Search Users"
          />
          <IconButton edge="end" onClick={handleClear}>
            <Clear />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
};
