import { pipe } from "fp-ts/lib/function";
import { cmd, sub } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as Navigation from "Framework/Navigation";
import { Sub } from "Framework/Sub";
import * as Games from "Games";
import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import * as Store from "Store";
import { exhaustive } from "Utility";
import * as View from "View";
import * as Account from "./Account";
import * as Chat from "./Chat";
import * as ChatNew from "./ChatNew";
import * as Game from "./Game";
import * as Home from "./Home";
import * as Login from "./Login";
import * as Logout from "./Logout";
import * as ProfileCreate from "./ProfileCreate";
import * as ProfileDelete from "./ProfileDelete";
import * as ProfileUpdate from "./ProfileUpdate";
import * as ProfileUpdateAvatar from "./ProfileUpdateAvatar";
import * as ProfileUpdateName from "./ProfileUpdateName";
import * as ProfileUpdateTheme from "./ProfileUpdateTheme";
import * as ProfileUpdateUsername from "./ProfileUpdateUsername";
import * as ChatConversation from "./ChatConversation";

//
//
//
// Model
//
//
//

export type Model =
  | (Login.Model & { page: "Login" })
  | (ProfileCreate.Model & { page: "ProfileCreate" })
  | (Logout.Model & { page: "Logout" })
  | (Home.Model & { page: "Home" })
  | (Account.Model & { page: "Account" })
  | (Logout.Model & { page: "Logout" })
  | (ProfileDelete.Model & { page: "ProfileDelete" })
  | (ProfileUpdate.Model & { page: "ProfileUpdate" })
  | (ProfileUpdateAvatar.Model & { page: "ProfileUpdateAvatar" })
  | (ProfileUpdateName.Model & { page: "ProfileUpdateName" })
  | (ProfileUpdateUsername.Model & { page: "ProfileUpdateUsername" })
  | (ProfileUpdateTheme.Model & { page: "ProfileUpdateTheme" })
  | (Chat.Model & { page: "Chat" })
  | (ChatNew.Model & { page: "ChatNew" })
  | (ChatConversation.Model & { page: "ChatConversation" })
  | { page: "Game" }
  | { page: "Loading" };

//
//
//
// Init
//
//
//

export const initLoading = (): [Model, Cmd<Msg>] => {
  return [{ page: "Loading" }, cmd.none];
};

export const initReady = (
  route: Route.Route,
  profile: Store.Profile.Profile
): [Model, Cmd<Msg>] => {
  switch (route.type) {
    case "Account":
      return [{ ...Account.init, page: "Account" }, cmd.none];

    case "Chat":
      return [{ ...Chat.init, page: "Chat" }, cmd.none];

    case "ChatNew":
      const [chatNew, chatNewCmd] = ChatNew.init();

      return [
        { ...chatNew, page: "ChatNew" },
        pipe(
          chatNewCmd,
          cmd.map((msg) => ({ ...msg, page: "ChatNew" }))
        ),
      ];

    case "ChatConversation":
      return [{ ...ChatConversation.init, page: "ChatConversation" }, cmd.none];

    case "Game":
      return [{ page: "Game" }, cmd.none];

    case "Home":
      return [{ ...Home.init, page: "Home" }, cmd.none];

    case "Logout":
      return [{ ...Logout.init, page: "Logout" }, cmd.none];

    case "ProfileDelete":
      return [{ ...ProfileDelete.init, page: "ProfileDelete" }, cmd.none];

    case "ProfileUpdate":
      return [{ ...ProfileUpdate.init, page: "ProfileUpdate" }, cmd.none];

    case "ProfileUpdateAvatar":
      return [
        { ...ProfileUpdateAvatar.init(profile), page: "ProfileUpdateAvatar" },
        cmd.none,
      ];

    case "ProfileUpdateName":
      return [
        { ...ProfileUpdateName.init(profile), page: "ProfileUpdateName" },
        cmd.none,
      ];

    case "ProfileUpdateUsername":
      return [
        {
          ...ProfileUpdateUsername.init(profile),
          page: "ProfileUpdateUsername",
        },
        cmd.none,
      ];

    case "ProfileUpdateTheme":
      return [
        {
          ...ProfileUpdateTheme.init,
          page: "ProfileUpdateTheme",
        },
        cmd.none,
      ];

    case "ProfileCreate":
    case "Login":
      return [
        { ...Home.init, page: "Home" },
        Navigation.push(Route.encode({ type: "Home" })),
      ];

    default:
      return exhaustive(route);
  }
};

export const initSessionMissing = (route: Route.Route): [Model, Cmd<Msg>] => {
  switch (route.type) {
    case "Login":
      return [{ ...Login.init, page: "Login" }, cmd.none];

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "ChatNew":
    case "Game":
    case "Home":
    case "Logout":
    case "ProfileCreate":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "ProfileUpdateTheme":
      return [
        { ...Login.init, page: "Login" },
        Navigation.push(Route.encode({ type: "Login" })),
      ];

    default:
      return exhaustive(route);
  }
};

export const initProfileMissing = (
  route: Route.Route,
  session: Session.Session
): [Model, Cmd<Msg>] => {
  switch (route.type) {
    case "ProfileCreate":
      return [
        { ...ProfileCreate.init(session), page: "ProfileCreate" },
        cmd.none,
      ];

    case "Logout":
      return [{ ...Logout.init, page: "Logout" }, cmd.none];

    case "Login":
    case "Account":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "Game":
    case "Home":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "ProfileUpdateTheme":
      return [
        { ...ProfileCreate.init(session), page: "ProfileCreate" },
        Navigation.push(Route.encode({ type: "ProfileCreate" })),
      ];

    default:
      return exhaustive(route);
  }
};

//
//
//
// Msg
//
//
//

export type Msg =
  | (Account.Msg & { page: "Account" })
  | (Home.Msg & { page: "Home" })
  | (Login.Msg & { page: "Login" })
  | (Logout.Msg & { page: "Logout" })
  | (ProfileCreate.Msg & { page: "ProfileCreate" })
  | (ProfileDelete.Msg & { page: "ProfileDelete" })
  | (ProfileUpdate.Msg & { page: "ProfileUpdate" })
  | (ProfileUpdateAvatar.Msg & { page: "ProfileUpdateAvatar" })
  | (ProfileUpdateName.Msg & { page: "ProfileUpdateName" })
  | (ProfileUpdateUsername.Msg & { page: "ProfileUpdateUsername" })
  | (Chat.Msg & { page: "Chat" })
  | (ChatNew.Msg & { page: "ChatNew" })
  | (ChatConversation.Msg & { page: "ChatConversation" })
  | (ProfileUpdateTheme.Msg & { page: "ProfileUpdateTheme" })
  | (Game.Msg & { page: "Games" });

export type GroupedMsg = Msg & { group: "Page" };

export type Action =
  | Session.GroupedMsg
  | Store.GroupedMsg
  | Snackbar.GroupedMsg
  | Games.GroupedMsg;

//
//
//
// Update
//
//
//

export const updateReady = (
  profile: Store.Profile.Profile,
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, Action[]] => {
  switch (model.page) {
    case "Account":
      if (msg.page === "Account") {
        return tagUpdate("Account", Account.update(profile, msg, model));
      }
      return [model, cmd.none, []];

    case "Home":
      if (msg.page === "Home") {
        return tagUpdate("Home", Home.update(msg, model));
      }
      return [model, cmd.none, []];

    case "Logout":
      if (msg.page === "Logout") {
        return tagUpdate("Logout", Logout.update(profile, msg, model));
      }
      return [model, cmd.none, []];

    case "ProfileDelete":
      if (msg.page === "ProfileDelete") {
        return tagUpdate(
          "ProfileDelete",
          ProfileDelete.update(profile, msg, model)
        );
      }
      return [model, cmd.none, []];

    case "ProfileUpdate":
      if (msg.page === "ProfileUpdate") {
        return tagUpdate(
          "ProfileUpdate",
          ProfileUpdate.update(profile, msg, model)
        );
      }
      return [model, cmd.none, []];

    case "ProfileUpdateAvatar":
      if (msg.page === "ProfileUpdateAvatar") {
        return tagUpdate(
          "ProfileUpdateAvatar",
          ProfileUpdateAvatar.update(profile, msg, model)
        );
      }
      return [model, cmd.none, []];

    case "ProfileUpdateName":
      if (msg.page === "ProfileUpdateName") {
        return tagUpdate(
          "ProfileUpdateName",
          ProfileUpdateName.update(profile, msg, model)
        );
      }
      return [model, cmd.none, []];

    case "ProfileUpdateUsername":
      if (msg.page === "ProfileUpdateUsername") {
        return tagUpdate(
          "ProfileUpdateUsername",
          ProfileUpdateUsername.update(profile, msg, model)
        );
      }
      return [model, cmd.none, []];

    case "Chat":
      if (msg.page === "Chat") {
        return tagUpdate("Chat", Chat.update(msg, model));
      }
      return [model, cmd.none, []];

    case "ChatNew":
      if (msg.page === "ChatNew") {
        return tagUpdate("ChatNew", ChatNew.update(msg, model));
      }
      return [model, cmd.none, []];

    case "ChatConversation":
      if (msg.page === "ChatConversation") {
        return tagUpdate(
          "ChatConversation",
          ChatConversation.update(msg, model)
        );
      }
      return [model, cmd.none, []];

    case "ProfileUpdateTheme":
      if (msg.page === "ProfileUpdateTheme") {
        return tagUpdate(
          "ProfileUpdateTheme",
          ProfileUpdateTheme.update(profile, msg, model)
        );
      }
      return [model, cmd.none, []];

    case "Game":
      return [model, cmd.none, []];

    case "Login":
    case "Loading":
    case "ProfileCreate":
      return [model, Navigation.push(Route.encode({ type: "Home" })), []];

    default:
      return exhaustive(model);
  }
};

export const updateProfileMissing = (
  session: Session.Session,
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, Action[]] => {
  switch (model.page) {
    case "Logout":
      if (msg.page === "Logout") {
        return tagUpdate(
          "Logout",
          Logout.update({ name: session.defaultName }, msg, model)
        );
      }
      return [model, cmd.none, []];

    case "ProfileCreate":
      if (msg.page === "ProfileCreate") {
        return tagUpdate(
          "ProfileCreate",
          ProfileCreate.update(session, msg, model)
        );
      }
      return [model, cmd.none, []];

    case "Home":
    case "Account":
    case "Login":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "ProfileUpdateTheme":
    case "Game":
    case "Loading":
      return [
        model,
        Navigation.push(Route.encode({ type: "ProfileCreate" })),
        [],
      ];

    default:
      return exhaustive(model);
  }
};

export const updateSessionMissing = (
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, Action[]] => {
  switch (model.page) {
    case "Login":
      if (msg.page === "Login") {
        return tagUpdate("Login", Login.update(msg, model));
      }
      return [model, cmd.none, []];

    case "ProfileCreate":
    case "Home":
    case "Account":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "ProfileUpdateTheme":
    case "Game":
    case "Loading":
    case "Logout":
      return [model, Navigation.push(Route.encode({ type: "Login" })), []];

    default:
      return exhaustive(model);
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
  switch (model.page) {
    case "Account":
      return sub.none;
    case "Chat":
      return sub.none;
    case "ChatNew":
      return sub.none;
    case "ChatConversation":
      return sub.none;
    case "Game":
      return sub.none;
    case "Home":
      return sub.none;
    case "Login":
      return sub.none;
    case "Logout":
      return sub.none;
    case "ProfileCreate":
      return sub.none;
    case "ProfileDelete":
      return sub.none;
    case "ProfileUpdate":
      return sub.none;
    case "ProfileUpdateAvatar":
      return sub.none;
    case "ProfileUpdateTheme":
      return sub.none;
    case "ProfileUpdateUsername":
      return sub.none;
    case "ProfileUpdateName":
      return sub.none;
    case "Loading":
      return sub.none;

    default:
      return exhaustive(model);
  }
};

//
//
//
// View
//
//
//

export const viewReady = (
  {
    profile,
    game,
    store,
  }: { game: Game.Model; profile: Store.Profile.Profile; store: Store.Model },
  model: Model
): View.View<Msg> => {
  switch (model.page) {
    case "Account":
      return tagView("Account", Account.view(profile, model));

    case "Chat":
      return tagView("Chat", Chat.view(model));

    case "ChatNew":
      return tagView("ChatNew", ChatNew.view(store, model));

    case "ChatConversation":
      return tagView("ChatConversation", ChatConversation.view(model));

    case "Home":
      return tagView("Home", Home.view({ profile, game }, model));

    case "Logout":
      return tagView("Logout", Logout.view(model));

    case "ProfileDelete":
      return tagView("ProfileDelete", ProfileDelete.view(model));

    case "ProfileUpdate":
      return tagView("ProfileUpdate", ProfileUpdate.view(profile, model));

    case "ProfileUpdateAvatar":
      return tagView("ProfileUpdateAvatar", ProfileUpdateAvatar.view(model));

    case "ProfileUpdateName":
      return tagView("ProfileUpdateName", ProfileUpdateName.view(model));

    case "ProfileUpdateTheme":
      return tagView(
        "ProfileUpdateTheme",
        ProfileUpdateTheme.view(profile, model)
      );

    case "ProfileUpdateUsername":
      return tagView(
        "ProfileUpdateUsername",
        ProfileUpdateUsername.view(model)
      );

    case "Game":
      return tagView("Games", Game.view(game));

    case "Login":
      return viewLoading;

    case "ProfileCreate":
      return viewLoading;

    case "Loading":
      return viewLoading;

    default:
      return exhaustive(model);
  }
};

export const viewProfileMissing = (
  session: Session.Session,
  model: Model
): View.View<Msg> => {
  switch (model.page) {
    case "Logout":
      return tagView("Logout", Logout.view(model));

    case "ProfileCreate":
      return tagView("ProfileCreate", ProfileCreate.view(model));

    case "Account":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "Home":
    case "Login":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateTheme":
    case "ProfileUpdateUsername":
    case "Game":
    case "Loading":
      return viewLoading;

    default:
      return exhaustive(model);
  }
};

export const viewSessionMissing = (model: Model): View.View<Msg> => {
  switch (model.page) {
    case "Login":
      return tagView("Login", Login.view(model));

    case "Account":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "Home":
    case "ProfileCreate":
    case "Logout":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateTheme":
    case "ProfileUpdateUsername":
    case "Game":
    case "Loading":
      return viewLoading;

    default:
      return exhaustive(model);
  }
};

const viewLoading: View.View<Msg> = () => <View.LoadingPage />;

//
//
//
// Helpers
//
//
//

const tagView = <TMsg, TPage extends Msg["page"]>(
  page: TPage,
  dom: View.View<TMsg>
): View.View<TMsg & { page: TPage }> => {
  return pipe(
    dom,
    View.map((msg) => ({ ...msg, page }))
  );
};

const tagUpdate = <TModel, TMsg, TAction, TPage extends Msg["page"]>(
  page: TPage,
  [modelPrev, cmdPrev, actionsPrev = []]:
    | [TModel, Cmd<TMsg>, TAction[]]
    | [TModel, Cmd<TMsg>]
): [TModel & { page: TPage }, Cmd<TMsg & { page: TPage }>, TAction[]] => {
  return [
    {
      ...modelPrev,
      page,
    },
    pipe(
      cmdPrev,
      cmd.map((msg) => ({ ...msg, page }))
    ),
    [...actionsPrev],
  ];
};
