import { Home, Person } from "@mui/icons-material";
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction as MuiBottomNavigationAction,
} from "@mui/material";
import { BottomNavigationActionProps } from "@mui/material/BottomNavigationAction";
import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { auth } from "src/features";

const BottomNavigationAction = ({
  to,
  ...props
}: { to: string } & BottomNavigationActionProps) => {
  return (
    <Link
      to={to}
      style={{
        // flex: 1,
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
      }}
    >
      <MuiBottomNavigationAction {...props} />
    </Link>
  );
};

export const BottomNavigation = () => {
  const authSlice = useSelector(auth.selectors.slice);
  const location = useLocation();
  return (
    <MuiBottomNavigation
      showLabels
      value={location.pathname}
      sx={{
        position: "fixed",
        width: "100%",
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <BottomNavigationAction value="/" to="/" icon={<Home />} label="Home" />

      {authSlice.type === "signed-in" && (
        <BottomNavigationAction
          value={`/profile/${authSlice.userId}`}
          to={`/profile/${authSlice.userId}`}
          icon={<Person />}
          label="Profile"
        />
      )}
    </MuiBottomNavigation>
  );
};
