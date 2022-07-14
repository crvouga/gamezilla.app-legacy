import * as Games from "Games/Frontend";
import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import * as Store from "Store";
import * as UI from "UI";
import { Cmd, Sub, pipe } from "Core";
import { exhaustive, tag } from "Utility";
import * as Account from "./Account";
import * as AccountCreate from "./AccountCreate";
import * as Chat from "./Chat";
import * as ChatConversation from "./ChatConversation";
import * as ChatNew from "./ChatNew";
import * as Game from "./Game";
import * as Home from "./Home";
import * as Login from "./Login";
import * as LoginEmail from "./LoginEmail";
import * as Logout from "./Logout";
import * as PasswordReset from "./PasswordReset";
import * as Profile from "./Profile";
import * as ProfileCreate from "./ProfileCreate";
import * as ProfileDelete from "./ProfileDelete";
import * as ProfileUpdate from "./ProfileUpdate";
import * as ProfileUpdateAvatar from "./ProfileUpdateAvatar";
import * as ProfileUpdateName from "./ProfileUpdateName";
import * as ProfileUpdateTheme from "./ProfileUpdateTheme";
import * as ProfileUpdateUsername from "./ProfileUpdateUsername";
import * as Search from "./Search";

//
//
//
// Model
//
//
//

export type Model =
  | ["Login", Login.Model]
  | ["ProfileCreate", ProfileCreate.Model]
  | ["Logout", Logout.Model]
  | ["Home", Home.Model]
  | ["Account", Account.Model]
  | ["Logout", Logout.Model]
  | ["Profile", Profile.Model]
  | ["ProfileDelete", ProfileDelete.Model]
  | ["ProfileUpdate", ProfileUpdate.Model]
  | ["ProfileUpdateAvatar", ProfileUpdateAvatar.Model]
  | ["ProfileUpdateName", ProfileUpdateName.Model]
  | ["ProfileUpdateUsername", ProfileUpdateUsername.Model]
  | ["ProfileUpdateTheme", ProfileUpdateTheme.Model]
  | ["Chat", Chat.Model]
  | ["ChatNew", ChatNew.Model]
  | ["PasswordReset", PasswordReset.Model]
  | ["LoginEmail", LoginEmail.Model]
  | ["AccountCreate", AccountCreate.Model]
  | ["Search", Search.Model]
  | ["ChatConversation", ChatConversation.Model]
  | ["Game"]
  | ["Loading"];

//
//
//
// Msg
//
//
//

export type Msg =
  | ["Account", Account.Msg]
  | ["Home", Home.Msg]
  | ["Login", Login.Msg]
  | ["LoginEmail", LoginEmail.Msg]
  | ["AccountCreate", AccountCreate.Msg]
  | ["Logout", Logout.Msg]
  | ["Profile", Profile.Msg]
  | ["ProfileCreate", ProfileCreate.Msg]
  | ["ProfileDelete", ProfileDelete.Msg]
  | ["ProfileUpdate", ProfileUpdate.Msg]
  | ["ProfileUpdateAvatar", ProfileUpdateAvatar.Msg]
  | ["ProfileUpdateName", ProfileUpdateName.Msg]
  | ["ProfileUpdateUsername", ProfileUpdateUsername.Msg]
  | ["ProfileUpdateTheme", ProfileUpdateTheme.Msg]
  | ["Chat", Chat.Msg]
  | ["PasswordReset", PasswordReset.Msg]
  | ["ChatNew", ChatNew.Msg]
  | ["ChatConversation", ChatConversation.Msg]
  | ["Search", Search.Msg]
  | ["ClickedBottomNavigationLink", Route.Route];

export type OutAction =
  | ["Store", Store.Action]
  | ["Snackbar", Snackbar.Action]
  | ["Games", Games.Action]
  | ["Session", Session.Action];

//
//
//
// Init
//
//
//

export const initLoading = (): [Model, Cmd.Cmd<Msg>] => {
  return [["Loading"], Cmd.None];
};

export const initReady = (
  route: Route.Route,
  profile: Store.Profile.Profile,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (route.type) {
    case "Account":
      return [["Account", Account.init], Cmd.None, []];

    case "Chat": {
      const [model, cmd, actions] = Chat.init(profile);
      return [["Chat", model], pipe(cmd, Cmd.map(tag("Chat"))), actions];
    }

    case "ChatNew": {
      const [chatNew, chatNewCmd, actions] = ChatNew.init();

      return [
        ["ChatNew", chatNew],
        pipe(chatNewCmd, Cmd.map(tag("ChatNew"))),
        actions,
      ];
    }

    case "ChatConversation": {
      const [model, cmd, actions] = ChatConversation.init({
        conversationId: route.conversationId,
      });
      return [
        ["ChatConversation", model],

        pipe(cmd, Cmd.map(tag("ChatConversation"))),
        actions,
      ];
    }

    case "Game":
      return [["Game"], Cmd.None, []];

    case "Home":
      return [["Home", Home.init], Cmd.None, []];

    case "Logout":
      return [["Logout", Logout.init], Cmd.None, []];

    case "ProfileDelete": {
      const [modelNew, cmdNew, actions] = ProfileDelete.init;
      return [
        ["ProfileDelete", modelNew],
        pipe(cmdNew, Cmd.map(tag("ProfileDelete"))),
        actions,
      ];
    }

    case "ProfileUpdate":
      return [["ProfileUpdate", ProfileUpdate.init], Cmd.None, []];

    case "ProfileUpdateAvatar":
      return [
        ["ProfileUpdateAvatar", ProfileUpdateAvatar.init(profile)],
        Cmd.None,
        [],
      ];

    case "ProfileUpdateName":
      return [
        ["ProfileUpdateName", ProfileUpdateName.init(profile)],
        Cmd.None,
        [],
      ];

    case "ProfileUpdateUsername":
      return [
        ["ProfileUpdateUsername", ProfileUpdateUsername.init(profile)],
        Cmd.None,
        [],
      ];

    case "ProfileUpdateTheme":
      return [["ProfileUpdateTheme", ProfileUpdateTheme.init], Cmd.None, []];

    case "Profile": {
      const [modelInit, cmdInit, actions] = Profile.init({
        userId: route.userId,
      });
      return [
        ["Profile", modelInit],
        pipe(cmdInit, Cmd.map(tag("Profile"))),
        actions,
      ];
    }

    case "Search": {
      const [modelInit, cmdInit, actionsInit] = Search.init;
      return [
        ["Search", modelInit],
        pipe(cmdInit, Cmd.map(tag("Search"))),
        actionsInit,
      ];
    }

    case "ProfileCreate":
    case "Login":
    case "LoginEmail":
    case "AccountCreate":
    case "PasswordReset":
      return [["Home", Home.init], Route.push({ type: "Home" }), []];

    default:
      return exhaustive(route);
  }
};

export const initSessionMissing = (
  route: Route.Route,
): [Model, Cmd.Cmd<Msg>] => {
  switch (route.type) {
    case "Login":
      return [["Login", Login.init], Cmd.None];

    case "LoginEmail":
      return [["LoginEmail", LoginEmail.init], Cmd.None];

    case "AccountCreate":
      const [modelNew, cmd] = AccountCreate.init();
      return [
        ["AccountCreate", modelNew],
        pipe(cmd, Cmd.map(tag("AccountCreate"))),
      ];

    case "PasswordReset":
      return [["PasswordReset", PasswordReset.init], Cmd.None];

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "ChatNew":
    case "Game":
    case "Home":
    case "Logout":
    case "Profile":
    case "ProfileCreate":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "Search":
    case "ProfileUpdateTheme":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
      return [["Login", Login.init], Route.push({ type: "Login" })];

    default:
      return exhaustive(route);
  }
};

export const initProfileMissing = (
  route: Route.Route,
  session: Session.Session,
): [Model, Cmd.Cmd<Msg>] => {
  switch (route.type) {
    case "ProfileCreate":
      return [["ProfileCreate", ProfileCreate.init(session)], Cmd.None];

    case "Logout":
      return [["Logout", Logout.init], Cmd.None];

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "ChatNew":
    case "Game":
    case "Search":
    case "Home":
    case "Profile":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateTheme":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Login":
    case "LoginEmail":
    case "AccountCreate":
    case "PasswordReset":
      return [
        ["ProfileCreate", ProfileCreate.init(session)],
        Route.push({ type: "ProfileCreate" }),
      ];
    default:
      return exhaustive(route);
  }
};

//
//
//
// Update
//
//
//

export const updateReady = (
  { profile, store }: { profile: Store.Profile.Profile; store: Store.Model },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  if (msg[0] === "ClickedBottomNavigationLink") {
    return [model, Route.push(msg[1]), []];
  }

  switch (model[0]) {
    case "Account":
      if (msg[0] === "Account") {
        return tagUpdate("Account", Account.update(profile, msg[1], model[1]));
      }
      return [model, Cmd.None, []];

    case "Home":
      if (msg[0] === "Home") {
        return tagUpdate("Home", Home.update(msg[1], model[1]));
      }
      return [model, Cmd.None, []];

    case "Logout":
      if (msg[0] === "Logout") {
        const ret = tagUpdate(
          "Logout",
          Logout.update(profile, msg[1], model[1]),
        );
        return ret;
      }
      return [model, Cmd.None, []];

    case "ProfileDelete":
      if (msg[0] === "ProfileDelete") {
        return tagUpdate(
          "ProfileDelete",
          ProfileDelete.update(profile, msg[1], model[1]),
        );
      }
      return [model, Cmd.None, []];

    case "ProfileUpdate":
      if (msg[0] === "ProfileUpdate") {
        return tagUpdate(
          "ProfileUpdate",
          ProfileUpdate.update(profile, msg[1], model[1]),
        );
      }
      return [model, Cmd.None, []];

    case "ProfileUpdateAvatar":
      if (msg[0] === "ProfileUpdateAvatar") {
        return tagUpdate(
          "ProfileUpdateAvatar",
          ProfileUpdateAvatar.update(profile, msg[1], model[1]),
        );
      }
      return [model, Cmd.None, []];

    case "ProfileUpdateName":
      if (msg[0] === "ProfileUpdateName") {
        return tagUpdate(
          "ProfileUpdateName",
          ProfileUpdateName.update(profile, msg[1], model[1]),
        );
      }
      return [model, Cmd.None, []];

    case "ProfileUpdateUsername":
      if (msg[0] === "ProfileUpdateUsername") {
        return tagUpdate(
          "ProfileUpdateUsername",
          ProfileUpdateUsername.update(profile, msg[1], model[1]),
        );
      }
      return [model, Cmd.None, []];

    case "Chat":
      if (msg[0] === "Chat") {
        return tagUpdate("Chat", Chat.update(msg[1], model[1]));
      }
      return [model, Cmd.None, []];

    case "ChatNew":
      if (msg[0] === "ChatNew") {
        return tagUpdate(
          "ChatNew",
          ChatNew.update(
            { store, authUserId: profile.userId },
            msg[1],
            model[1],
          ),
        );
      }
      return [model, Cmd.None, []];

    case "ChatConversation":
      if (msg[0] === "ChatConversation") {
        const [modelPage, cmdPage, actions] = ChatConversation.update(
          { userId: profile.userId },
          msg[1],
          model[1],
        );
        return [
          ["ChatConversation", modelPage],
          pipe(cmdPage, Cmd.map(tag("ChatConversation"))),
          actions,
        ];
      }
      return [model, Cmd.None, []];

    case "ProfileUpdateTheme":
      if (msg[0] === "ProfileUpdateTheme") {
        return tagUpdate(
          "ProfileUpdateTheme",
          ProfileUpdateTheme.update(profile, msg[1], model[1]),
        );
      }
      return [model, Cmd.None, []];

    case "Game":
      return [model, Cmd.None, []];

    case "Profile":
      if (msg[0] === "Profile") {
        const [modelPage, cmdPage, actions] = Profile.update(
          { authUserId: profile.userId },
          msg[1],
          model[1],
        );
        return [
          ["Profile", modelPage],
          pipe(cmdPage, Cmd.map(tag("Profile"))),
          actions,
        ];
      }

      return [model, Cmd.None, []];

    case "Search":
      if (msg[0] === "Search") {
        return tagUpdate("Search", Search.update(msg[1], model[1]));
      }

      return [model, Cmd.None, []];

    case "Login":
    case "Loading":
    case "ProfileCreate":
    case "LoginEmail":
    case "AccountCreate":
    case "PasswordReset":
      return [model, Route.push({ type: "Home" }), []];

    default:
      return exhaustive(model);
  }
};

export const updateProfileMissing = (
  session: Session.Session,
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model[0]) {
    case "Logout":
      if (msg[0] === "Logout") {
        return tagUpdate(
          "Logout",
          Logout.update({ name: session.defaultName }, msg[1], model[1]),
        );
      }
      return [model, Cmd.None, []];

    case "ProfileCreate":
      if (msg[0] === "ProfileCreate") {
        return tagUpdate(
          "ProfileCreate",
          ProfileCreate.update(session, msg[1], model[1]),
        );
      }
      return [model, Cmd.None, []];

    case "Home":
    case "Account":
    case "Login":
    case "Profile":
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
    case "LoginEmail":
    case "AccountCreate":
    case "PasswordReset":
    case "Search":
      return [model, Route.push({ type: "ProfileCreate" }), []];

    default:
      return exhaustive(model);
  }
};

export const updateSessionMissing = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model[0]) {
    case "Login":
      if (msg[0] === "Login") {
        return tagUpdate("Login", Login.update(msg[1], model[1]));
      }
      return [model, Cmd.None, []];

    case "LoginEmail":
      if (msg[0] === "LoginEmail") {
        return tagUpdate("LoginEmail", LoginEmail.update(msg[1], model[1]));
      }
      return [model, Cmd.None, []];

    case "AccountCreate": {
      if (msg[0] === "AccountCreate") {
        return tagUpdate(
          "AccountCreate",
          AccountCreate.update(msg[1], model[1]),
        );
      }
      return [model, Cmd.None, []];
    }

    case "PasswordReset": {
      if (msg[0] === "PasswordReset") {
        return tagUpdate(
          "PasswordReset",
          PasswordReset.update(msg[1], model[1]),
        );
      }
      return [model, Cmd.None, []];
    }

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
    case "Profile":
    case "Search":
      return [model, Route.push({ type: "Login" }), []];

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

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  switch (model[0]) {
    case "ChatNew":
      return pipe(ChatNew.subscriptions(model[1]), Sub.map(tag("ChatNew")));

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "Game":
    case "Home":
    case "Login":
    case "Logout":
    case "ProfileCreate":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateTheme":
    case "ProfileUpdateUsername":
    case "ProfileUpdateName":
    case "Loading":
    case "LoginEmail":
    case "AccountCreate":
    case "PasswordReset":
    case "Profile":
    case "Search":
      return Sub.None;

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
    route,
  }: {
    route: Route.Route;
    game: Game.Model;
    profile: Store.Profile.Profile;
    store: Store.Model;
  },
  model: Model,
): UI.View<Msg> => {
  switch (model[0]) {
    case "Account":
      return (dispatch) => (
        <UI.Page>
          {tagView("Account", Account.view(profile, model[1]))(dispatch)}
          {viewBottomNavigation("Account", route)(dispatch)}
        </UI.Page>
      );

    case "Chat":
      return (dispatch) => (
        <UI.Page>
          {tagView("Chat", Chat.view({ profile, store }, model[1]))(dispatch)}
          {viewBottomNavigation("Chat", route)(dispatch)}
        </UI.Page>
      );

    case "Home":
      return (dispatch) => (
        <UI.Page>
          {tagView(
            "Home",
            Home.view({ route, profile, game }, model[1]),
          )(dispatch)}
          {viewBottomNavigation("Home", route)(dispatch)}
        </UI.Page>
      );

    case "Search":
      return (dispatch) => (
        <UI.Page>
          {tagView("Search", Search.view({ store }, model[1]))(dispatch)}
          {viewBottomNavigation("Search", route)(dispatch)}
        </UI.Page>
      );

    case "ChatNew":
      return tagView(
        "ChatNew",
        ChatNew.view({ store, currentUserProfile: profile }, model[1]),
      );

    case "ChatConversation":
      return tagView(
        "ChatConversation",
        ChatConversation.view({ store, authUser: profile }, model[1]),
      );

    case "Logout":
      return tagView("Logout", Logout.view(model[1]));

    case "ProfileDelete":
      return tagView(
        "ProfileDelete",
        ProfileDelete.view({ store, profileId: profile.userId }, model[1]),
      );

    case "ProfileUpdate":
      return tagView("ProfileUpdate", ProfileUpdate.view(profile, model));

    case "ProfileUpdateAvatar":
      return tagView("ProfileUpdateAvatar", ProfileUpdateAvatar.view(model[1]));

    case "ProfileUpdateName":
      return tagView("ProfileUpdateName", ProfileUpdateName.view(model[1]));

    case "ProfileUpdateTheme":
      return tagView(
        "ProfileUpdateTheme",
        ProfileUpdateTheme.view(profile, model[1]),
      );

    case "ProfileUpdateUsername":
      return tagView(
        "ProfileUpdateUsername",
        ProfileUpdateUsername.view(model[1]),
      );

    case "Game":
      return () => <></>;
    // return tagView("Game", Game.view(game));

    case "Profile":
      return tagView("Profile", Profile.view({ store }, model[1]));

    case "Login":
    case "ProfileCreate":
    case "Loading":
    case "LoginEmail":
    case "PasswordReset":
    case "AccountCreate":
      return viewLoading;

    default:
      return exhaustive(model);
  }
};

export const viewProfileMissing = (
  _session: Session.Session,
  model: Model,
): UI.View<Msg> => {
  switch (model[0]) {
    case "Logout":
      return tagView("Logout", Logout.view(model[1]));

    case "ProfileCreate":
      return tagView("ProfileCreate", ProfileCreate.view(model[1]));

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "ChatNew":
    case "Game":
    case "Home":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateTheme":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Login":
    case "LoginEmail":
    case "Loading":
    case "Search":
    case "AccountCreate":
    case "PasswordReset":
    case "Profile":
      return viewLoading;

    default:
      return exhaustive(model);
  }
};

export const viewSessionMissing = (model: Model): UI.View<Msg> => {
  switch (model[0]) {
    case "Login":
      return tagView("Login", Login.view(model[1]));

    case "LoginEmail":
      return tagView("LoginEmail", LoginEmail.view(model[1]));

    case "AccountCreate":
      return tagView("AccountCreate", AccountCreate.view(model[1]));

    case "PasswordReset":
      return tagView("PasswordReset", PasswordReset.view(model[1]));

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
    case "ProfileUpdateTheme":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Profile":
    case "Search":
    case "Loading":
      return viewLoading;

    default:
      return exhaustive(model);
  }
};

const viewLoading: UI.View<Msg> = () => <UI.LoadingPage />;

//
//
//
//
//
//
//
//

const viewBottomNavigation =
  (
    page: "Home" | "Search" | "Chat" | "Account",
    route: Route.Route,
  ): UI.View<Msg> =>
  (dispatch) => {
    return (
      <UI.BottomNavigation
        showLabels
        value={route.type}
        onChange={(_event, routeType) => {
          if (routeType in Route.routesTypes) {
            dispatch(["ClickedBottomNavigationLink", { type: routeType }]);
          }
        }}
      >
        <UI.BottomNavigationAction
          icon={<UI.Icons.Home />}
          label="Home"
          value={Route.routesTypes.Home}
        />
        <UI.BottomNavigationAction
          icon={<UI.Icons.Search />}
          label="Search"
          value={Route.routesTypes.Search}
        />
        <UI.BottomNavigationAction
          icon={<UI.Icons.Chat />}
          label="Chat"
          value={Route.routesTypes.Chat}
        />
        <UI.BottomNavigationAction
          icon={<UI.Icons.Person />}
          label="Profile"
          value={Route.routesTypes.Account}
        />
      </UI.BottomNavigation>
    );
  };

//
//
//
// Helpers
//
//
//

const tagView = <TMsg, TPage extends Msg[0]>(
  page: TPage,
  dom: UI.View<TMsg>,
): UI.View<[TPage, TMsg]> => {
  return pipe(dom, UI.map(tag(page)));
};

const tagUpdate = <TModel, TMsg, TAction, TPage extends Msg[0]>(
  page: TPage,
  [modelPrev, cmdPrev, actionsPrev = []]:
    | [TModel, Cmd.Cmd<TMsg>, TAction[]]
    | [TModel, Cmd.Cmd<TMsg>],
): [[TPage, TModel], Cmd.Cmd<[TPage, TMsg]>, TAction[]] => {
  return [[page, modelPrev], pipe(cmdPrev, Cmd.map(tag(page))), actionsPrev];
};
