import { AppBar, Box, Toolbar } from "@mui/material";
import React from "react";

export const PageBar = ({
  left,
  center,
  right,
}: {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}) => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        {left && <Box>{left}</Box>}
        {center && <Box>{center}</Box>}
        {right && <Box>{right}</Box>}
      </Toolbar>
    </AppBar>
  );
};
