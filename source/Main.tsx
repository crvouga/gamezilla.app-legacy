import { either, option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { createRoot } from "react-dom/client";
import { cmd, react, sub, navigation } from "./Framework";
import { programWithDebugger } from "./Framework/Debug/Navigation";
import { attempt, perform } from "./Framework/Task";
import * as Session from "./Session";
import * as Profile from "./Profile";
import * as View from "./View";

//
//
//
// Model
//
//
//

export type Model =
  | { type: "SessionLoading"; location: Location }
  | { type: "SessionMissing"; location: Location; page: LoginPage }
  | {
      type: "ProfileLoading";
      location: Location;
      userId: string;
      defaultName: string;
    }
  | {
      type: "ProfileMissing";
      location: Location;
      page: LogoutPage | ProfileCreatePage;
    }
  | { type: "Ready"; location: Location; page: HomePage };

type Location = { pathname: string };

type LoginPage = { type: "LoginPage" };

type ProfileCreatePage = { type: "ProfileCreatePage" };

type LogoutPage = { type: "LogoutPage" };

type HomePage = { type: "HomePage" };

type Page = LoginPage | ProfileCreatePage | LogoutPage | HomePage;

//
//
//

export const init = (location: navigation.Location): [Model, cmd.Cmd<Msg>] => [
  { type: "SessionLoading", location: location },
  pipe(Session.load(), perform(maybeSessionToMsg)),
];

const maybeSessionToMsg = option.fold<Session.Session, Msg>(
  () => ({ type: "SessionNotFound" }),
  (session) => ({ type: "SessionFound", ...session })
);

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "SessionFound"; userId: string; defaultName: string }
  | { type: "SessionNotFound" }
  | { type: "ProfileFound"; profile: { name: string; avatarUrl: string } }
  | { type: "ProfileNotFound" }
  | { type: "ChangedPage"; page: Page };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ChangedPage":
      return [model, cmd.none];

    case "ProfileFound":
      return [
        { type: "Ready", location: model.location, page: { type: "HomePage" } },
        cmd.none,
      ];

    case "ProfileNotFound":
      return [model, cmd.none];

    case "SessionFound":
      return [
        { ...msg, location: model.location, type: "ProfileLoading" },
        pipe(Profile.load(msg), attempt(profileResultToMsg)),
      ];

    case "SessionNotFound":
      return [
        {
          type: "SessionMissing",
          location: model.location,
          page: { type: "LoginPage" },
        },
        cmd.none,
      ];
  }
};

const profileResultToMsg = either.fold<Error, Profile.Profile, Msg>(
  (error) => ({ type: "ProfileNotFound" }),
  (profile) => ({ type: "ProfileFound", profile })
);

//
//
//
// subscriptions
//
//
//

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  switch (model.type) {
    case "ProfileLoading":
      return sub.none;

    case "ProfileMissing":
      return sub.none;

    case "Ready":
      return sub.none;

    case "SessionLoading":
      return sub.none;

    case "SessionMissing":
      return sub.none;
  }
};

//
//
//
// View
//
//
//

export const view = (model: Model): react.Html<Msg> => {
  return () => (
    <View.ThemeProvider>
      <View.LoadingPage />
    </View.ThemeProvider>
  );
};

//
//
//
// location
//
//
//

const locationToMsg = (location: navigation.Location): Msg => {
  return { type: "ChangedPage", page: { type: "HomePage" } };
};

//
//
//
// Main
//
//
//

const main = () => {
  const Program =
    process.env.NODE_ENV === "production"
      ? navigation.program
      : programWithDebugger;

  const program = Program(locationToMsg, init, update, view, subscriptions);

  const rootElement = document.getElementById("root");

  if (rootElement) {
    const root = createRoot(rootElement);

    react.run(program, (dom) => {
      root.render(dom);
    });
  }
};

//
//
//

main();
