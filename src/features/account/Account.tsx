import { ChevronRight, DeleteForever, Edit, Logout } from "@mui/icons-material";
import {
  AppBar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import BackButton from "../../components/BackButton";

const Account = ({
  profile,
}: {
  profile: { username?: string; avatarUrl?: string };
}) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <BackButton />
          <Typography variant="h6">Account</Typography>
        </Toolbar>
      </AppBar>

      <List>
        <Link to="/profile/edit">
          <ListItemButton>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary="Edit Profile" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>
        </Link>

        <Link to="/profile/delete">
          <ListItemButton divider>
            <ListItemIcon>
              <DeleteForever />
            </ListItemIcon>
            <ListItemText primary="Delete Profile" />
          </ListItemButton>
        </Link>

        <Link to="/logout">
          <ListItemButton>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Link>
      </List>
    </>
  );
};

export default Account;
