import * as Account from "./Account";
import * as Chess from "./Chess";
import * as ConnectFour from "./ConnectFour";
import * as Home from "./Home";
import * as Login from "./Login";
import * as Logout from "./Logout";
import * as ProfileCreate from "./ProfileCreate";
import * as ProfileDelete from "./ProfileDelete";
import * as ProfileUpdate from "./ProfileUpdate";
import * as ProfileUpdateAvatar from "./ProfileUpdateAvatar";
import * as ProfileUpdateName from "./ProfileUpdateName";
import * as ProfileUpdateUsername from "./ProfileUpdateUsername";
import * as TicTacToe from "./TicTacToe";

export type Msg =
  | Account.Msg
  | Chess.Msg
  | ConnectFour.Msg
  | Home.Msg
  | Login.Msg
  | Logout.Msg
  | ProfileCreate.Msg
  | ProfileDelete.Msg
  | ProfileUpdate.Msg
  | ProfileUpdateAvatar.Msg
  | ProfileUpdateName.Msg
  | ProfileUpdateUsername.Msg
  | TicTacToe.Msg;

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
