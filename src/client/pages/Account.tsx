import { Close } from "@mui/icons-material";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-location";

export const AccountPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => {
              navigate({ to: "/", replace: true });
            }}
          >
            <Close />
          </IconButton>
          <Typography variant="h6">Account</Typography>
        </Toolbar>
      </AppBar>
    </>
  );
};
