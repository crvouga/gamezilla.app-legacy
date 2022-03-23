import React from "react";
import { Toolbar, Typography, AppBar as MuiAppBar } from "@mui/material";

export const AppBar = ({
  start,
  title,
  end,
}: {
  start?: React.ReactNode[];
  title: string;
  end?: React.ReactNode[];
}) => {
  return (
    <MuiAppBar>
      <Toolbar>
        {React.Children.map(start, (node) => node)}

        <Typography sx={{ fontWeight: "bold", flex: 1 }} variant="h5">
          {title}
        </Typography>

        {React.Children.map(end, (node) => node)}
      </Toolbar>
    </MuiAppBar>
  );
};
