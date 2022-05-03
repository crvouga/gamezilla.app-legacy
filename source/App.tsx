import { Box, CircularProgress } from "@mui/material";
import { cmd, react, sub } from "elm-ts";
import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import React from "react";
import * as Page from "./Page";
import * as Profile from "./Profile";
import * as Session from "./Session";

/* 


Model


*/

export type Model =
  | { type: "SessionLoading" }
  | { type: "SessionNotFound"; child: Page.Login.Model }
  | { type: "ProfileLoading"; session: Session.Session }
  | {
      type: "ProfileNotFound";
      session: Session.Session;
      child: Page.ProfileCreate.Model;
    }
  | { type: "ProfileFound"; profile: Profile.Profile };

type Flags = null;

export const init = (_: Flags): [Model, cmd.Cmd<Msg>] => {
  return [{ type: "SessionLoading" }, cmd.none];
};

/*


Update


*/

export type Msg =
  | { type: "SessionFound"; session: Session.Session }
  | { type: "SessionNotFound" }
  | { type: "ProfileNotFound" }
  | { type: "ProfileFound"; profile: Profile.Profile }
  | { type: "GotProfileCreateMsg"; msg: Page.ProfileCreate.Msg }
  | { type: "GotLoginMsg"; msg: Page.Login.Msg };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "SessionFound":
      return [
        { type: "ProfileLoading", session: msg.session },
        Profile.fetch<Msg>({
          userId: msg.session.userId,
          onFailure: () => ({ type: "ProfileNotFound" }),
          onSuccess: (profile) => ({ type: "ProfileFound", profile }),
        }),
      ];

    case "SessionNotFound":
      return [{ type: "SessionNotFound", child: Page.Login.init() }, cmd.none];

    case "ProfileFound":
      return [{ ...msg, type: "ProfileFound" }, cmd.none];

    case "ProfileNotFound":
      if (model.type === "ProfileLoading") {
        return [
          {
            type: "ProfileNotFound",
            session: model.session,
            child: Page.ProfileCreate.init(model.session),
          },
          cmd.none,
        ];
      }

      return [model, cmd.none];

    case "GotProfileCreateMsg":
      if (model.type === "ProfileNotFound") {
        const [childModel, childCmd] = Page.ProfileCreate.update(model.session)(
          msg.msg,
          model.child
        );

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "GotProfileCreateMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "GotLoginMsg":
      if (model.type === "SessionNotFound") {
        const [childModel, childCmd] = Page.Login.update(msg.msg, model.child);

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "GotLoginMsg", msg }))
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
        Page.Login.view(model.child),
        react.map((msg) => ({ type: "GotLoginMsg", msg }))
      );

    case "ProfileNotFound":
      return pipe(
        Page.ProfileCreate.view(model.child),
        react.map((msg) => ({ type: "GotProfileCreateMsg", msg }))
      );

    case "ProfileFound":
      return () => <>profileFound</>;
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
  (profile) => ({ type: "ProfileFound", profile })
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
