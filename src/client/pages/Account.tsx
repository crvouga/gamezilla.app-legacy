import { ChevronRight, Close, Logout } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-location";
import { Link } from "../components/Link";

export const AccountPage = ({
  profile,
}: {
  profile: { username: string; avatarUrl?: string };
}) => {
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

      <List>
        <ListItemButton>
          <ListItemAvatar>
            <Avatar src={profile.avatarUrl} />
          </ListItemAvatar>
          <ListItemText
            primaryTypographyProps={{ variant: "h6" }}
            primary={profile.username}
          />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>

      <Divider />

      <List>
        <Link href="/logout">
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
