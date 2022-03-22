import React from "react";
import { Toolbar, Typography, AppBar as MuiAppBar } from "@mui/material";

export const AppBar = ({
  title,
  end,
}: {
  title: string;
  end?: React.ReactNode[];
}) => {
  return (
    <MuiAppBar>
      <Toolbar>
        <Typography sx={{ fontWeight: "bold", flex: 1 }} variant="h5">
          {title}
        </Typography>

        {React.Children.map(end, (node) => node)}
      </Toolbar>
    </MuiAppBar>
  );
};
