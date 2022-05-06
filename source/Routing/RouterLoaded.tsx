import { pipe } from "fp-ts/lib/function";
import { cmd, react } from "../Framework";
import * as Profile from "../Profile";
import * as Routes from "./Routes";
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

export const init = (
  route: Routes.Route,
  profile: Profile.Profile
): [Model, cmd.Cmd<Msg>] => {
  switch (route.type) {
    case "Account":
      return [{ type: "Account", model: Page.Account.init }, cmd.none];

    case "Chess":
      return [{ type: "Chess", model: Page.Chess.init }, cmd.none];

    case "ConnectFour":
      return [{ type: "ConnectFour", model: Page.ConnectFour.init }, cmd.none];

    case "Home":
      return [{ type: "Home", model: Page.Home.init }, cmd.none];

    case "Logout":
      return [{ type: "Logout", model: Page.Logout.init }, cmd.none];

    case "ProfileDelete":
      return [
        { type: "ProfileDelete", model: Page.ProfileDelete.init },
        cmd.none,
      ];

    case "ProfileUpdate":
      return [
        { type: "ProfileUpdate", model: Page.ProfileUpdate.init(profile) },
        cmd.none,
      ];

    case "ProfileUpdateName":
      return [
        {
          type: "ProfileUpdateName",
          model: Page.ProfileUpdateName.init(profile),
        },
        cmd.none,
      ];

    case "ProfileUpdateUsername":
      return [
        {
          type: "ProfileUpdateUsername",
          model: Page.ProfileUpdateUsername.init(profile),
        },
        cmd.none,
      ];

    case "ProfileUpdateAvatar":
      return [
        {
          type: "ProfileUpdateAvatar",
          model: Page.ProfileUpdateAvatar.init(profile),
        },
        cmd.none,
      ];

    case "ProfileUpdateAvatarStyle":
      return [
        {
          type: "ProfileUpdateAvatarStyle",
          model: Page.ProfileUpdateAvatarStyle.init(profile),
        },
        cmd.none,
      ];

    case "TicTacToe":
      return [
        {
          type: "TicTacToe",
          model: Page.TicTacToe.init,
        },
        cmd.none,
      ];

    case "ProfileCreate":
      return [
        { type: "Home", model: Page.Home.init },
        Routes.replace({ type: "Home" }),
      ];

    case "Login":
      return [
        { type: "Home", model: Page.Home.init },
        Routes.replace({ type: "Home" }),
      ];

    case "NotFound":
      return [
        { type: "Home", model: Page.Home.init },
        Routes.replace({ type: "Home" }),
      ];
  }
};

/* 


Update


*/

export type Msg =
  | Page.Account.Msg
  | Page.Chess.Msg
  | Page.ConnectFour.Msg
  | Page.Home.Msg
  | Page.Logout.Msg
  | Page.ProfileDelete.Msg
  | Page.ProfileUpdate.Msg
  | Page.ProfileUpdateAvatar.Msg
  | Page.ProfileUpdateAvatarStyle.Msg
  | Page.ProfileUpdateName.Msg
  | Page.ProfileUpdateUsername.Msg
  | Page.TicTacToe.Msg;

export const update = (
  profile: Profile.Profile,
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Account":
      if (msg.group == "Account") {
        const [pageModel, pageCmd] = Page.Account.update(msg, model.model);
        return [{ ...model, model: pageModel }, pageCmd];
      }
      return [model, cmd.none];

    case "Chess":
      if (msg.group == "Chess") {
        const [pageModel, pageCmd] = Page.Chess.update(msg, model.model);
        return [{ ...model, model: pageModel }, pageCmd];
      }
      return [model, cmd.none];

    case "ConnectFour":
      if (msg.group == "ConnectFour") {
        const [pageModel, pageCmd] = Page.ConnectFour.update(msg, model.model);
        return [{ ...model, model: pageModel }, pageCmd];
      }
      return [model, cmd.none];

    case "Home":
      if (msg.group === "Home") {
        const [pageModel, pageCmd] = Page.Home.update(msg, model.model);

        return [{ ...model, model: pageModel }, pageCmd];
      }
      return [model, cmd.none];

    case "Logout":
      if (msg.group === "Logout") {
        const [pageModel, pageCmd] = Page.Logout.update(msg, model.model);
        return [{ ...model, model: pageModel }, pageCmd];
      }
      return [model, cmd.none];

    case "ProfileDelete":
      if (msg.group === "ProfileDelete") {
        const [pageModel, pageCmd] = Page.ProfileDelete.update(
          profile,
          msg,
          model.model
        );

        return [{ ...model, model: pageModel }, pageCmd];
      }
      return [model, cmd.none];

    case "ProfileUpdate":
      if (msg.group === "ProfileUpdate") {
        const [pageModel, pageCmd] = Page.ProfileUpdate.update(
          profile,
          msg,
          model.model
        );
        return [{ ...model, model: pageModel }, pageCmd];
      }

      return [model, cmd.none];

    case "ProfileUpdateAvatar":
      if (msg.group === "ProfileUpdateAvatar") {
        const [pageModel, pageCmd] = Page.ProfileUpdateAvatar.update(
          profile,
          msg,
          model.model
        );
        return [{ ...model, model: pageModel }, pageCmd];
      }

      return [model, cmd.none];

    case "ProfileUpdateAvatarStyle":
      if (msg.group === "ProfileUpdateAvatarStyle") {
        const [pageModel, pageCmd] = Page.ProfileUpdateAvatarStyle.update(
          msg,
          model.model
        );
        return [{ ...model, model: pageModel }, pageCmd];
      }

      return [model, cmd.none];

    case "ProfileUpdateName":
      if (msg.group == "ProfileUpdateName") {
        const [pageModel, pageCmd] = Page.ProfileUpdateName.update(
          profile,
          msg,
          model.model
        );
        return [{ ...model, model: pageModel }, pageCmd];
      }

      return [model, cmd.none];

    case "ProfileUpdateUsername":
      if (msg.group == "ProfileUpdateUsername") {
        const [pageModel, pageCmd] = Page.ProfileUpdateUsername.update(
          profile,
          msg,
          model.model
        );
        return [{ ...model, model: pageModel }, pageCmd];
      }

      return [model, cmd.none];

    case "TicTacToe":
      if (msg.group == "TicTacToe") {
        const [pageModel, pageCmd] = Page.TicTacToe.update(msg, model.model);
        return [{ ...model, model: pageModel }, pageCmd];
      }

      return [model, cmd.none];
  }
};

/*


View


*/

export const view = (
  profile: Profile.Profile,
  model: Model
): react.Html<Msg> => {
  switch (model.type) {
    case "Home":
      return Page.Home.view(profile, model.model);

    case "Account":
      return Page.Account.view(profile, model.model);

    case "Chess":
      return Page.Chess.view(model.model);

    case "ConnectFour":
      return Page.ConnectFour.view(model.model);

    case "Logout":
      return Page.Logout.view(model.model);

    case "ProfileDelete":
      return Page.ProfileDelete.view(model.model);

    case "ProfileUpdate":
      return Page.ProfileUpdate.view(profile, model.model);

    case "ProfileUpdateAvatar":
      return Page.ProfileUpdateAvatar.view(profile, model.model);

    case "ProfileUpdateAvatarStyle":
      return Page.ProfileUpdateAvatarStyle.view(model.model);

    case "ProfileUpdateName":
      return Page.ProfileUpdateName.view(model.model);

    case "ProfileUpdateUsername":
      return Page.ProfileUpdateUsername.view(model.model);

    case "TicTacToe":
      return Page.TicTacToe.view(model.model);
  }
};
