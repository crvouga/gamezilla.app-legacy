import { Box, BoxProps } from "@mui/material";
import React from "react";

const AspectRatioSquare = ({ children, sx, ...props }: BoxProps) => {
  return (
    <Box
      sx={{
        width: "100%",
        paddingTop: "100%",
        height: 0,
        position: "relative",
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AspectRatioSquare;
