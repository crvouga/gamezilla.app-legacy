export * as Account from "./Account";
export * as Chess from "./Chess";
export * as ConnectFour from "./ConnectFour";
export * as Home from "./Home";
export * as Login from "./Login";
export * as Logout from "./Logout";
export * as ProfileCreate from "./Profile/Create";
export * as ProfileDelete from "./Profile/Delete";
export * as ProfileUpdate from "./Profile/Update";
export * as ProfileUpdateAvatar from "./Profile/Update/Avatar";
export * as ProfileUpdateName from "./Profile/Profile/Update/Name";
export * as ProfileUpdateUsername from "./Profile/Update/Username";
export * as TicTacToe from "./TicTacToe";

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
      child: Profile.Model;
    };
