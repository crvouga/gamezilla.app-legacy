import { DeleteForever, ChevronRight, Edit, Logout } from "@mui/icons-material";
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
import BackButton from "../components/BackButton";
import { Link } from "../components/Link";

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
        <Link href="/profile/edit">
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

        <Link href="/logout">
          <ListItemButton>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Link>

        <Link href="/profile/delete">
          <ListItemButton color="error.main">
            <ListItemIcon>
              <DeleteForever />
            </ListItemIcon>
            <ListItemText primary="Delete Profile" />
          </ListItemButton>
        </Link>
      </List>
    </>
  );
};

export default Account;
