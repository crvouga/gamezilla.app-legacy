import { Box, CircularProgress } from "@mui/material";
import { cmd, react, sub } from "elm-ts";
import * as Navigation from "elm-ts/lib/Navigation";
import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import React from "react";
import * as Page from "./Page";
import * as Profile from "./Profile";
import * as Session from "./Session";
import * as Router from "./Router";

/* 


Model


*/

export type Model =
  | {
      type: "SessionLoading";
    }
  | {
      type: "ProfileLoading";
      session: Session.Session;
    }
  | {
      type: "SessionNotFound";
      page: Page.Login.Model;
    }
  | {
      type: "ProfileNotFound";
      session: Session.Session;
      page: Page.ProfileCreate.Model;
    }
  | {
      type: "ProfileFound";
      profile: Profile.Profile;
      router: Router.Model;
    };

type Flags = null;

export const init =
  (_flags: Flags) =>
  (_location: Navigation.Location): [Model, cmd.Cmd<Msg>] => {
    return [{ type: "SessionLoading" }, cmd.none];
  };

export const locationToMsg = (location: Navigation.Location): Msg => {
  return {
    type: "GotRouterMsg",
    msg: Router.locationToMsg(location.pathname.substring(1)),
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
        { type: "ProfileLoading", session: msg.session },
        Profile.fetch<Msg>({
          userId: msg.session.userId,
          onFailure: () => ({ type: "ProfileNotFound" }),
          onSuccess: (profile) => ({
            type: "ProfileFound",
            route: "Home",
            profile,
          }),
        }),
      ];

    case "SessionNotFound":
      return [{ type: "SessionNotFound", page: Page.Login.init() }, cmd.none];

    case "GotLoginPageMsg":
      if (model.type === "SessionNotFound") {
        const [pageModel, pageCmd] = Page.Login.update(msg.msg, model.page);

        return [
          { type: "SessionNotFound", page: pageModel },
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
            type: "ProfileNotFound",
            session: model.session,
            page: Page.ProfileCreate.init(model.session),
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
        { ...msg, type: "ProfileFound", router: Router.init("") },
        cmd.none,
      ];

    case "GotRouterMsg":
      if (model.type === "ProfileFound") {
        const [routerModel, routerCmd] = Router.update(msg.msg, model.router);

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


View


*/

export const view = (model: Model): react.Html<Msg> => {
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
