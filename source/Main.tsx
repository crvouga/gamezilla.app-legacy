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
import { cmd, react, sub } from "./Framework";
import * as DebugNavigation from "./Framework/Debug/Navigation";
import * as Navigation from "./Framework/Navigation";
import * as Page from "./Page";
import * as Profile from "./Profile";
import * as Router from "./Navigation";
import * as Session from "./Session";

/* 


Main


*/

export const main = () => {
  const program =
    process.env.NODE_ENV === "production"
      ? Navigation.programWithFlags
      : DebugNavigation.programWithDebuggerWithFlags;

  const mainProgram = program(locationToMsg, init, update, view, subscriptions);

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("Failed to get root element");
  }

  const root = createRoot(rootElement);

  react.run(mainProgram(), (dom) => {
    root.render(dom);
  });
};

/* 


Model


*/

export type Model =
  | {
      type: "SessionLoading";
      pathname: string;
    }
  | {
      type: "ProfileLoading";
      session: Session.Session;
      pathname: string;
    }
  | {
      type: "SessionNotFound";
      page: Page.Login.Model;
      pathname: string;
    }
  | {
      type: "ProfileNotFound";
      session: Session.Session;
      page: Page.ProfileCreate.Model;
      pathname: string;
    }
  | {
      type: "ProfileFound";
      profile: Profile.Profile;
      router: Router.Model;
      pathname: string;
    };

type Flags = void;

export const init =
  (flags: Flags) =>
  (location: Navigation.Location): [Model, cmd.Cmd<Msg>] =>
    [
      { type: "SessionLoading", pathname: Router.locationToPathname(location) },
      cmd.batch([
        Router.push(Router.locationToRoute(location)),
        Session.fetch<Msg>({
          onFailure: () => ({ type: "SessionNotFound" }),
          onSuccess: (session) => ({ type: "SessionFound", session }),
        }),
      ]),
    ];

export const locationToMsg = (location: Navigation.Location): Msg => {
  return {
    type: "GotRouterMsg",
    msg: Router.locationToMsg(location),
  };
};

/*


Update


*/

export type Msg =
  | { type: "SessionFound"; session: Session.Session }
  | { type: "SessionNotFound" }
  | { type: "ProfileNotFound" }
  | { type: "ProfileFound"; profile: Profile.Profile }
  | { type: "GotProfileCreatePageMsg"; msg: Page.ProfileCreate.Msg }
  | { type: "GotLoginPageMsg"; msg: Page.Login.Msg }
  | { type: "GotRouterMsg"; msg: Router.Msg };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "SessionFound":
      return [
        { ...model, type: "ProfileLoading", session: msg.session },
        Profile.fetch<Msg>({
          userId: msg.session.userId,
          onFailure: () => ({ type: "ProfileNotFound" }),
          onSuccess: (profile) => ({
            type: "ProfileFound",
            route: Router.pathnameToRoute(model.pathname),
            profile,
          }),
        }),
      ];

    case "SessionNotFound":
      return [
        { ...model, type: "SessionNotFound", page: Page.Login.init() },
        cmd.none,
      ];

    case "GotLoginPageMsg":
      if (model.type === "SessionNotFound") {
        const [pageModel, pageCmd] = Page.Login.update(msg.msg, model.page);

        return [
          { ...model, type: "SessionNotFound", page: pageModel },
          pipe(
            pageCmd,
            cmd.map((msg) => ({ type: "GotLoginPageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "ProfileNotFound":
      if (model.type === "ProfileLoading") {
        return [
          {
            ...model,
            type: "ProfileNotFound",
            session: model.session,
            page: Page.ProfileCreate.init(model.session),
          },
          cmd.none,
        ];
      }

      if (model.type === "ProfileFound") {
        const session: Session.Session = {
          defaultName: model.profile.name,
          userId: model.profile.userId,
        };
        return [
          {
            ...model,
            type: "ProfileNotFound",
            session,
            page: Page.ProfileCreate.init(session),
          },
          cmd.none,
        ];
      }

      return [model, cmd.none];

    case "GotProfileCreatePageMsg":
      if (model.type === "ProfileNotFound") {
        const [pageModel, pageCmd] = Page.ProfileCreate.update(model.session)(
          msg.msg,
          model.page
        );

        return [
          {
            ...model,
            type: "ProfileNotFound",
            page: pageModel,
          },
          pipe(
            pageCmd,
            cmd.map((msg) => ({ type: "GotProfileCreatePageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "ProfileFound":
      return [
        {
          ...model,
          ...msg,
          type: "ProfileFound",
          router: Router.routeToInit(
            msg.profile,
            Router.pathnameToRoute(model.pathname)
          ),
        },
        cmd.none,
      ];

    case "GotRouterMsg":
      if (model.type === "ProfileFound") {
        const [routerModel, routerCmd] = Router.update(model.profile)(
          msg.msg,
          model.router
        );

        return [
          { ...model, router: routerModel },
          pipe(
            routerCmd,
            cmd.map((msg) => ({ type: "GotRouterMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];
  }
};

/* 


Subscriptions


*/

const profileToMsg = Option.fold<Profile.Profile, Msg>(
  () => ({ type: "ProfileNotFound" }),
  (profile) => ({ type: "ProfileFound", route: "Home", profile })
);

const profileSub = (model: Model): sub.Sub<Msg> => {
  switch (model.type) {
    case "SessionLoading":
      return sub.none;

    case "SessionNotFound":
      return sub.none;

    case "ProfileFound":
      return pipe(Profile.subscription(model.profile), sub.map(profileToMsg));

    case "ProfileLoading":
      return pipe(Profile.subscription(model.session), sub.map(profileToMsg));

    case "ProfileNotFound":
      return pipe(Profile.subscription(model.session), sub.map(profileToMsg));
  }
};

const sessionToMsg = Option.fold<Session.Session, Msg>(
  () => ({ type: "SessionNotFound" }),
  (session) => ({ type: "SessionFound", session })
);

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  return sub.batch([
    pipe(Session.subscription, sub.map(sessionToMsg)),
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

    case "SessionNotFound":
      return pipe(
        Page.Login.view(model.page),
        react.map((msg) => ({ type: "GotLoginPageMsg", msg }))
      );

    case "ProfileNotFound":
      return pipe(
        Page.ProfileCreate.view(model.page),
        react.map((msg) => ({ type: "GotProfileCreatePageMsg", msg }))
      );

    case "ProfileFound":
      return pipe(
        Router.view(model.profile, model.router),
        react.map((msg) => ({ type: "GotRouterMsg", msg }))
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
