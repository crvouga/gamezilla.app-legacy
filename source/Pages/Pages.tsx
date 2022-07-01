import * as Games from "Games";
import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import * as Store from "Store";
import * as View from "View";
import { Cmd, Option, Sub, pipe } from "Core";
import { exhaustive } from "Utility";
import * as Account from "./Account";
import * as Chat from "./Chat";
import * as ChatConversation from "./ChatConversation";
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
  | (ChatConversation.Model & {
      page: "ChatConversation";
      conversationId: string;
    })
  | { page: "Game" }
  | { page: "Loading" };

//
//
//
// Init
//
//
//

export const initLoading = (): [Model, Cmd.Cmd<Msg>] => {
  return [{ page: "Loading" }, Cmd.None];
};

export const initReady = (
  route: Route.Route,
  profile: Store.Profile.Profile,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (route.type) {
    case "Account":
      return [{ ...Account.init, page: "Account" }, Cmd.None, []];

    case "Chat": {
      const [model, cmd, actions] = Chat.init(profile);
      return [
        { ...model, page: "Chat" },
        pipe(
          cmd,
          Cmd.map((msg) => ({ ...msg, page: "Chat" })),
        ),
        actions,
      ];
    }

    case "ChatNew": {
      const [chatNew, chatNewCmd, actions] = ChatNew.init();

      return [
        { ...chatNew, page: "ChatNew" },
        pipe(
          chatNewCmd,
          Cmd.map((msg) => ({ ...msg, page: "ChatNew" })),
        ),
        actions,
      ];
    }

    case "ChatConversation": {
      const [model, cmd, actions] = ChatConversation.init({
        conversationId: route.conversationId,
      });
      return [
        {
          ...model,
          page: "ChatConversation",
          conversationId: route.conversationId,
        },
        pipe(
          cmd,
          Cmd.map((msg) => ({ ...msg, page: "ChatConversation" })),
        ),
        actions,
      ];
    }

    case "Game":
      return [{ page: "Game" }, Cmd.None, []];

    case "Home":
      return [{ ...Home.init, page: "Home" }, Cmd.None, []];

    case "Logout":
      return [{ ...Logout.init, page: "Logout" }, Cmd.None, []];

    case "ProfileDelete": {
      const [modelNew, cmdNew, actions] = ProfileDelete.init;
      return [
        { ...modelNew, page: "ProfileDelete" },
        pipe(
          cmdNew,
          Cmd.map((msg) => ({ ...msg, page: "ProfileDelete" })),
        ),
        actions,
      ];
    }

    case "ProfileUpdate":
      return [{ ...ProfileUpdate.init, page: "ProfileUpdate" }, Cmd.None, []];

    case "ProfileUpdateAvatar":
      return [
        {
          ...ProfileUpdateAvatar.init(profile),
          page: "ProfileUpdateAvatar",
        },
        Cmd.None,
        [],
      ];

    case "ProfileUpdateName":
      return [
        {
          ...ProfileUpdateName.init(profile),
          page: "ProfileUpdateName",
        },
        Cmd.None,
        [],
      ];

    case "ProfileUpdateUsername":
      return [
        {
          ...ProfileUpdateUsername.init(profile),
          page: "ProfileUpdateUsername",
        },
        Cmd.None,
        [],
      ];

    case "ProfileUpdateTheme":
      return [
        {
          ...ProfileUpdateTheme.init,
          page: "ProfileUpdateTheme",
        },
        Cmd.None,
        [],
      ];

    case "ProfileCreate":
    case "Login":
      return [{ ...Home.init, page: "Home" }, Route.push({ type: "Home" }), []];

    default:
      return exhaustive(route);
  }
};

export const initSessionMissing = (
  route: Route.Route,
): [Model, Cmd.Cmd<Msg>] => {
  switch (route.type) {
    case "Login":
      return [{ ...Login.init, page: "Login" }, Cmd.None];

    default:
      return [{ ...Login.init, page: "Login" }, Route.push({ type: "Login" })];
  }
};

export const initProfileMissing = (
  route: Route.Route,
  session: Session.Session,
): [Model, Cmd.Cmd<Msg>] => {
  switch (route.type) {
    case "ProfileCreate":
      return [
        { ...ProfileCreate.init(session), page: "ProfileCreate" },
        Cmd.None,
      ];

    case "Logout":
      return [{ ...Logout.init, page: "Logout" }, Cmd.None];

    default:
      return [
        { ...ProfileCreate.init(session), page: "ProfileCreate" },
        Route.push({ type: "ProfileCreate" }),
      ];
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
  | (Game.Msg & { page: "Games" })
  | ClickedBottomNavigationLink;

type ClickedBottomNavigationLink = {
  type: "ClickedBottomNavigationLink";
  route: Route.Route;
  page: "Home" | "Chat" | "Account";
};

export type GroupedMsg = Msg & { group: "Page" };

export type OutAction =
  | Store.Action
  | Snackbar.Action
  | Games.Action
  | Session.Action;

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
  if (msg.type === "ClickedBottomNavigationLink") {
    return [model, Route.push(msg.route), []];
  }

  switch (model.page) {
    case "Account":
      if (msg.page === "Account") {
        return tagUpdate("Account", Account.update(profile, msg, model));
      }
      return [model, Cmd.None, []];

    case "Home":
      if (msg.page === "Home") {
        return tagUpdate("Home", Home.update(msg, model));
      }
      return [model, Cmd.None, []];

    case "Logout":
      if (msg.page === "Logout") {
        return tagUpdate("Logout", Logout.update(profile, msg, model));
      }
      return [model, Cmd.None, []];

    case "ProfileDelete":
      if (msg.page === "ProfileDelete") {
        return tagUpdate(
          "ProfileDelete",
          ProfileDelete.update(profile, msg, model),
        );
      }
      return [model, Cmd.None, []];

    case "ProfileUpdate":
      if (msg.page === "ProfileUpdate") {
        return tagUpdate(
          "ProfileUpdate",
          ProfileUpdate.update(profile, msg, model),
        );
      }
      return [model, Cmd.None, []];

    case "ProfileUpdateAvatar":
      if (msg.page === "ProfileUpdateAvatar") {
        return tagUpdate(
          "ProfileUpdateAvatar",
          ProfileUpdateAvatar.update(profile, msg, model),
        );
      }
      return [model, Cmd.None, []];

    case "ProfileUpdateName":
      if (msg.page === "ProfileUpdateName") {
        return tagUpdate(
          "ProfileUpdateName",
          ProfileUpdateName.update(profile, msg, model),
        );
      }
      return [model, Cmd.None, []];

    case "ProfileUpdateUsername":
      if (msg.page === "ProfileUpdateUsername") {
        return tagUpdate(
          "ProfileUpdateUsername",
          ProfileUpdateUsername.update(profile, msg, model),
        );
      }
      return [model, Cmd.None, []];

    case "Chat":
      if (msg.page === "Chat") {
        return tagUpdate("Chat", Chat.update(msg, model));
      }
      return [model, Cmd.None, []];

    case "ChatNew":
      if (msg.page === "ChatNew") {
        return tagUpdate(
          "ChatNew",
          ChatNew.update({ store, authUserId: profile.userId }, msg, model),
        );
      }
      return [model, Cmd.None, []];

    case "ChatConversation":
      if (msg.page === "ChatConversation") {
        const [modelPage, cmdPage, actions = []] = ChatConversation.update(
          msg,
          model,
        );
        return [
          {
            ...modelPage,
            conversationId: model.conversationId,
            page: "ChatConversation",
          },
          pipe(
            cmdPage,
            Cmd.map((msg) => ({ ...msg, page: "ChatConversation" })),
          ),
          actions,
        ];
      }
      return [model, Cmd.None, []];

    case "ProfileUpdateTheme":
      if (msg.page === "ProfileUpdateTheme") {
        return tagUpdate(
          "ProfileUpdateTheme",
          ProfileUpdateTheme.update(profile, msg, model),
        );
      }
      return [model, Cmd.None, []];

    case "Game":
      return [model, Cmd.None, []];

    case "Login":
    case "Loading":
    case "ProfileCreate":
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
  switch (model.page) {
    case "Logout":
      if (msg.page === "Logout") {
        return tagUpdate(
          "Logout",
          Logout.update({ name: session.defaultName }, msg, model),
        );
      }
      return [model, Cmd.None, []];

    case "ProfileCreate":
      if (msg.page === "ProfileCreate") {
        return tagUpdate(
          "ProfileCreate",
          ProfileCreate.update(session, msg, model),
        );
      }
      return [model, Cmd.None, []];

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
      return [model, Route.push({ type: "ProfileCreate" }), []];

    default:
      return exhaustive(model);
  }
};

export const updateSessionMissing = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model.page) {
    case "Login":
      if (msg.page === "Login") {
        return tagUpdate("Login", Login.update(msg, model));
      }
      return [model, Cmd.None, []];

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
  switch (model.page) {
    case "Account":
      return Sub.None;

    case "Chat":
      return Sub.None;

    case "ChatNew":
      return pipe(
        ChatNew.subscriptions(model),
        Sub.map((msg) => ({ ...msg, page: "ChatNew" })),
      );

    case "ChatConversation":
      return Sub.None;

    case "Game":
      return Sub.None;

    case "Home":
      return Sub.None;

    case "Login":
      return Sub.None;

    case "Logout":
      return Sub.None;

    case "ProfileCreate":
      return Sub.None;

    case "ProfileDelete":
      return Sub.None;

    case "ProfileUpdate":
      return Sub.None;

    case "ProfileUpdateAvatar":
      return Sub.None;

    case "ProfileUpdateTheme":
      return Sub.None;

    case "ProfileUpdateUsername":
      return Sub.None;

    case "ProfileUpdateName":
      return Sub.None;

    case "Loading":
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
): View.View<Msg> => {
  switch (model.page) {
    case "Account":
      return (dispatch) => (
        <View.Page>
          {tagView("Account", Account.view(profile, model))(dispatch)}
          {viewBottomNavigation("Account", route)(dispatch)}
        </View.Page>
      );

    case "Chat":
      return (dispatch) => (
        <View.Page>
          {tagView("Chat", Chat.view({ profile, store }, model))(dispatch)}
          {viewBottomNavigation("Chat", route)(dispatch)}
        </View.Page>
      );

    case "Home":
      return (dispatch) => (
        <View.Page>
          {tagView(
            "Home",
            Home.view({ route, profile, game }, model),
          )(dispatch)}
          {viewBottomNavigation("Home", route)(dispatch)}
        </View.Page>
      );

    case "ChatNew":
      return tagView(
        "ChatNew",
        ChatNew.view({ store, currentUserProfile: profile }, model),
      );

    case "ChatConversation":
      return tagView(
        "ChatConversation",
        ChatConversation.view(store, model.conversationId, model),
      );

    case "Logout":
      return tagView("Logout", Logout.view(model));

    case "ProfileDelete":
      return tagView(
        "ProfileDelete",
        ProfileDelete.view({ store, profileId: profile.userId }, model),
      );

    case "ProfileUpdate":
      return tagView("ProfileUpdate", ProfileUpdate.view(profile, model));

    case "ProfileUpdateAvatar":
      return tagView("ProfileUpdateAvatar", ProfileUpdateAvatar.view(model));

    case "ProfileUpdateName":
      return tagView("ProfileUpdateName", ProfileUpdateName.view(model));

    case "ProfileUpdateTheme":
      return tagView(
        "ProfileUpdateTheme",
        ProfileUpdateTheme.view(profile, model),
      );

    case "ProfileUpdateUsername":
      return tagView(
        "ProfileUpdateUsername",
        ProfileUpdateUsername.view(model),
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
  _session: Session.Session,
  model: Model,
): View.View<Msg> => {
  switch (model.page) {
    case "Logout":
      return tagView("Logout", Logout.view(model));

    case "ProfileCreate":
      return tagView("ProfileCreate", ProfileCreate.view(model));

    default:
      return viewLoading;
  }
};

export const viewSessionMissing = (model: Model): View.View<Msg> => {
  switch (model.page) {
    case "Login":
      return tagView("Login", Login.view(model));

    default:
      return viewLoading;
  }
};

const viewLoading: View.View<Msg> = () => <View.LoadingPage />;

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
    page: ClickedBottomNavigationLink["page"],
    route: Route.Route,
  ): View.View<Msg> =>
  (dispatch) => {
    return (
      <View.BottomNavigation
        showLabels
        value={route.type}
        onChange={(_event, valueNew) => {
          if (valueNew in Route.routesTypes) {
            dispatch({
              type: "ClickedBottomNavigationLink",
              page,
              route: { type: valueNew },
            });
          }
        }}
      >
        <View.BottomNavigationAction
          icon={<View.Icons.Home />}
          label="Home"
          value={Route.routesTypes.Home}
        />
        <View.BottomNavigationAction
          icon={<View.Icons.Chat />}
          label="Chat"
          value={Route.routesTypes.Chat}
        />
        <View.BottomNavigationAction
          icon={<View.Icons.Person />}
          label="Profile"
          value={Route.routesTypes.Account}
        />
      </View.BottomNavigation>
    );
  };

//
//
//
// Helpers
//
//
//

const tagView = <TMsg, TPage extends Msg["page"]>(
  page: TPage,
  dom: View.View<TMsg>,
): View.View<TMsg & { page: TPage }> => {
  return pipe(
    dom,
    View.map((msg) => ({ ...msg, page })),
  );
};

const tagUpdate = <TModel, TMsg, TAction, TPage extends Msg["page"]>(
  page: TPage,
  [modelPrev, cmdPrev, actionsPrev = []]:
    | [TModel, Cmd.Cmd<TMsg>, TAction[]]
    | [TModel, Cmd.Cmd<TMsg>],
): [TModel & { page: TPage }, Cmd.Cmd<TMsg & { page: TPage }>, TAction[]] => {
  return [
    {
      ...modelPrev,
      page,
    },
    pipe(
      cmdPrev,
      Cmd.map((msg) => ({ ...msg, page })),
    ),
    [...actionsPrev],
  ];
};
