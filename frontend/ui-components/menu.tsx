import {
  ListItemText,
  ListItemIcon,
  Menu as MuiMenu,
  MenuItem,
} from "@mui/material";
import React from "react";

type IItem = {
  icon?: React.ReactNode;
  title: string;
  onClick: () => void;
};

export const Menu = ({
  anchorEl,
  open,
  items,
  onClose,
}: {
  anchorEl?: HTMLElement | null;
  open: boolean;
  items: IItem[];
  onClose?: () => void;
}) => {
  return (
    <MuiMenu onClose={onClose} anchorEl={anchorEl} open={open}>
      {items.map((item) => (
        <MenuItem onClick={item.onClick} key={item.title}>
          {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
          <ListItemText>{item.title}</ListItemText>
        </MenuItem>
      ))}
    </MuiMenu>
  );
};
