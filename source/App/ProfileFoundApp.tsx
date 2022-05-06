import * as Page from "../Page";

/* 


Model


*/

export type Model =
  | { type: "Account"; model: Page.Account.Model }
  | { type: "Chess"; model: Page.Chess.Model }
  | { type: "ConnectFour"; model: Page.ConnectFour.Model }
  | { type: "Home"; model: Page.Home.Model }
  | { type: "Logout"; model: Page.Logout.Model }
  | { type: "ProfileDelete"; model: Page.ProfileDelete.Model }
  | { type: "ProfileUpdate"; model: Page.ProfileUpdate.Model }
  | { type: "ProfileUpdateAvatar"; model: Page.ProfileUpdateAvatar.Model }
  | {
      type: "ProfileUpdateAvatarStyle";
      model: Page.ProfileUpdateAvatarStyle.Model;
    }
  | { type: "ProfileUpdateName"; model: Page.ProfileUpdateName.Model }
  | { type: "ProfileUpdateUsername"; model: Page.ProfileUpdateUsername.Model }
  | { type: "TicTacToe"; model: Page.TicTacToe.Model };
