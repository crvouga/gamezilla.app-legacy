import {
  Box,
  CircularProgress,
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import * as React from "react";
import { createRoot } from "react-dom/client";
import * as Auth from "./Auth";
import { cmd, react, sub } from "./Framework";
import * as DebugNavigation from "./Framework/Debug/Navigation";
import * as Navigation from "./Framework/Navigation";
import * as Profile from "./Profile";
import * as Routing from "./Routing";

/* 


Main


*/

export const main = (): Error[] => {
  const program =
    process.env.NODE_ENV === "production"
      ? Navigation.program
      : DebugNavigation.programWithDebugger;

  const mainProgram = program(locationToMsg, init, update, view, subscriptions);

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    return [new Error("Failed to get root element from html document")];
  }

  const root = createRoot(rootElement);

  react.run(mainProgram, (node) => root.render(node));

  return [];
};

/* 


Model


*/

export type Model =
  | {
      type: "SessionLoading";
      route: Routing.Routes.Route;
    }
  | {
      type: "SessionMissing";
      route: Routing.Routes.Route;
      router: Routing.SessionMissing.Model;
    }
  | {
      type: "ProfileLoading";
      session: Auth.Session;
      route: Routing.Routes.Route;
    }
  | {
      type: "ProfileMissing";
      session: Auth.Session;
      route: Routing.Routes.Route;
      router: Routing.ProfileMissing.Model;
    }
  | {
      type: "Loaded";
      session: Auth.Session;
      profile: Profile.Profile;
      route: Routing.Routes.Route;
      router: Routing.Loaded.Model;
    };

export const init = (location: Navigation.Location): [Model, cmd.Cmd<Msg>] => [
  {
    type: "SessionLoading",
    route: Routing.Routes.decode(location.pathname.substring(1)),
  },
  Auth.fetch<Msg>({
    onFailure: () => ({ type: "SessionNotFound" }),
    onSuccess: (session) => ({ type: "SessionFound", session }),
  }),
];

export const locationToMsg = (location: Navigation.Location): Msg => {
  return {
    type: "RouteChanged",
    route: Routing.Routes.decode(location.pathname.substring(1)),
  };
};

/*


Update


*/

export type Msg =
  | { type: "SessionNotFound" }
  | { type: "SessionFound"; session: Auth.Session }
  | { type: "ProfileNotFound"; session: Auth.Session }
  | { type: "ProfileFound"; session: Auth.Session; profile: Profile.Profile }
  | { type: "RouteChanged"; route: Routing.Routes.Route }
  | { type: "GotSessionMissingRouterMsg"; msg: Routing.SessionMissing.Msg }
  | { type: "GotProfileMissingRouterMsg"; msg: Routing.ProfileMissing.Msg }
  | { type: "GotLoadedRouterMsg"; msg: Routing.Loaded.Msg };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "RouteChanged":
      switch (model.type) {
        case "Loaded":
          const [routerModel, routerCmd] = Routing.Loaded.init(
            msg.route,
            model.profile
          );
          return [
            {
              type: "Loaded",
              profile: model.profile,
              session: model.session,
              route: msg.route,
              router: routerModel,
            },
            pipe(
              routerCmd,
              cmd.map((msg) => ({ type: "GotLoadedRouterMsg", msg }))
            ),
          ];

        case "ProfileLoading":
          return [{ ...model, route: msg.route }, cmd.none];

        case "ProfileMissing":
          return [
            {
              ...model,
              route: msg.route,
              router: Routing.ProfileMissing.init(model.session),
            },
            cmd.none,
          ];

        case "SessionLoading":
          return [{ ...model, route: msg.route }, cmd.none];

        case "SessionMissing":
          return [
            {
              ...model,
              route: msg.route,
              router: Routing.SessionMissing.init(),
            },
            cmd.none,
          ];
      }

    case "ProfileFound":
      const [routerModel, routerCmd] = Routing.Loaded.init(
        model.route,
        msg.profile
      );
      return [
        {
          type: "Loaded",
          profile: msg.profile,
          session: msg.session,
          route: model.route,
          router: routerModel,
        },
        pipe(
          routerCmd,
          cmd.map((msg) => ({ type: "GotLoadedRouterMsg", msg }))
        ),
      ];

    case "ProfileNotFound":
      return [
        {
          type: "ProfileMissing",
          session: msg.session,
          route: model.route,
          router: Routing.ProfileMissing.init(msg.session),
        },
        cmd.none,
      ];

    case "SessionFound":
      return [
        {
          ...model,
          type: "ProfileLoading",
          session: msg.session,
        },
        Profile.fetch<Msg>({
          userId: msg.session.userId,
          onFailure: () => ({
            type: "ProfileNotFound",
            session: msg.session,
          }),
          onSuccess: (profile) => ({
            type: "ProfileFound",
            profile,
            session: msg.session,
          }),
        }),
      ];

    case "SessionNotFound":
      return [
        {
          ...model,
          type: "SessionMissing",
          router: Routing.SessionMissing.init(),
        },
        cmd.none,
      ];

    case "GotLoadedRouterMsg":
      if (model.type === "Loaded") {
        const [routerModel, routerCmd] = Routing.Loaded.update(
          model.profile,
          msg.msg,
          model.router
        );

        return [
          { ...model, router: routerModel },
          pipe(
            routerCmd,
            cmd.map((msg) => ({ type: "GotLoadedRouterMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "GotSessionMissingRouterMsg":
      if (model.type === "SessionMissing") {
        const [routerModel, routerCmd] = Routing.SessionMissing.update(
          msg.msg,
          model.router
        );

        return [
          { ...model, router: routerModel },
          pipe(
            routerCmd,
            cmd.map((msg) => ({ type: "GotSessionMissingRouterMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "GotProfileMissingRouterMsg":
      if (model.type === "ProfileMissing") {
        const [routerModel, routerCmd] = Routing.ProfileMissing.update(
          model.session,
          msg.msg,
          model.router
        );

        return [
          { ...model, router: routerModel },
          pipe(
            routerCmd,
            cmd.map((msg) => ({ type: "GotProfileMissingRouterMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];
  }
};

/* 


Subscriptions


*/

const profileToMsg = (session: Auth.Session) =>
  Option.fold<Profile.Profile, Msg>(
    () => ({ type: "ProfileNotFound", session }),
    (profile) => ({ type: "ProfileFound", profile, session })
  );

const profileSub = (model: Model): sub.Sub<Msg> => {
  switch (model.type) {
    case "SessionLoading":
      return sub.none;

    case "SessionMissing":
      return sub.none;

    case "ProfileLoading":
      return pipe(
        Profile.subscription(model.session),
        sub.map(profileToMsg(model.session))
      );

    case "ProfileMissing":
      return pipe(
        Profile.subscription(model.session),
        sub.map(profileToMsg(model.session))
      );

    case "Loaded":
      return pipe(
        Profile.subscription(model.profile),
        sub.map(profileToMsg(model.session))
      );
  }
};

const sessionToMsg = Option.fold<Auth.Session, Msg>(
  () => ({ type: "SessionNotFound" }),
  (session) => ({ type: "SessionFound", session })
);

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  return sub.batch([
    pipe(Auth.subscription, sub.map(sessionToMsg)),
    profileSub(model),
  ]);
};

/* 


View


*/

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) => {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {viewMain(model)(dispatch)}
      </ThemeProvider>
    );
  };

export const viewMain = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "SessionLoading":
      return viewLoading;

    case "ProfileLoading":
      return viewLoading;

    case "ProfileMissing":
      return pipe(
        Routing.ProfileMissing.view(model.router),
        react.map((msg) => ({ type: "GotProfileMissingRouterMsg", msg }))
      );

    case "SessionMissing":
      return pipe(
        Routing.SessionMissing.view(model.router),
        react.map((msg) => ({ type: "GotSessionMissingRouterMsg", msg }))
      );

    case "Loaded":
      return pipe(
        Routing.Loaded.view(model.profile, model.router),
        react.map((msg) => ({ type: "GotLoadedRouterMsg", msg }))
      );
  }
};

const viewLoading: react.Html<Msg> = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <CircularProgress size="4rem" />
    </Box>
  );
};

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "dark",
      primary: green,
    },
    typography: {
      fontFamily: ["Nunito"].join(","),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "120px",
          },
        },
      },
    },
  })
);
