import * as Account from "./Account";
import * as Chess from "./Chess";
import * as ConnectFour from "./ConnectFour";
import * as Home from "./Home";
import * as Login from "./Login";
import * as Logout from "./Logout";
import * as ProfileCreate from "./Profile/Create";
import * as ProfileDelete from "./Profile/Delete";
import * as ProfileUpdate from "./Profile/Update";
import * as ProfileUpdateAvatar from "./Profile/Update/Avatar";
import * as ProfileUpdateName from "./Profile/Update/Name";
import * as ProfileUpdateUsername from "./Profile/Update/Username";
import * as TicTacToe from "./TicTacToe";

export type Route =
  | {
      type: "/home";
      child: Home.Model;
    }
  | {
      type: "/account";
      child: Account.Model;
    }
  | {
      type: "/chess";
      child: Chess.Model;
    }
  | {
      type: "/connect-four";
      pachildge: ConnectFour.Model;
    }
  | {
      type: "/logout";
      child: Logout.Model;
    }
  | {
      type: "/profile";
    };

export {
  Account,
  Chess,
  ConnectFour,
  Home,
  Login,
  Logout,
  ProfileCreate,
  ProfileDelete,
  ProfileUpdate,
  ProfileUpdateAvatar,
  ProfileUpdateName,
  ProfileUpdateUsername,
  TicTacToe,
};
