import { Box } from "@mui/material";
import React from "react";

export const ListItem = ({
  start,
  center,
  end,
  onClick,
}: {
  onClick?: () => void;
  start?: React.ReactNode;
  center?: React.ReactNode;
  end?: React.ReactNode;
}) => {
  return (
    <Box
      className="text-gray-700 w-full flex flex-row justify-start items-center font-bold p-4 border-b hover:opacity-75 active:opacity-50 cursor-pointer"
      sx={{
        width: "100%",
        display: "flex",
      }}
      onClick={onClick}
    >
      {start && <Box sx={{ marginRight: 4 }}>{start}</Box>}
      {center && <Box sx={{ flex: 1 }}>{center}</Box>}
      {end && <Box>{end}</Box>}
    </Box>
  );
};
