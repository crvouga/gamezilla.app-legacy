import * as React from "react";
import * as ProfileMissingApp from "./ProfileMissingApp";
import * as ProfileFoundApp from "./ProfileFoundApp";
import * as Profile from "../Profile";
import { cmd, react, sub } from "../Framework";
import * as View from "../View";
import * as Auth from "../Auth";
import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";

//
//
//
//
// Model
//
//
//
//

export type Model = Loading | ProfileFound | ProfileMissing;

type Loading = {
  type: "Loading";
};

type ProfileMissing = {
  type: "ProfileMissing";
  child: ProfileMissingApp.Model;
};

type ProfileFound = {
  type: "ProfileFound";
  profile: Profile.Profile;
  child: ProfileFoundApp.Model;
};

export const init = (session: Auth.Session): [Model, cmd.Cmd<Msg>] => {
  return [
    { type: "Loading" },
    Profile.fetch<Msg>({
      ...session,
      onSuccess: (profile) => ({ type: "ProfileFound", profile }),
      onFailure: () => ({ type: "ProfileMissing" }),
    }),
  ];
};

const initProfileFound = (
  location: { pathname: string },
  profile: Profile.Profile
): [ProfileFound, cmd.Cmd<Msg>] => {
  const [childModel, childCmd] = ProfileFoundApp.init(location, profile);

  return [
    { type: "ProfileFound", profile, child: childModel },
    pipe(
      childCmd,
      cmd.map((msg) => ({ type: "ProfileFoundAppMsg", msg }))
    ),
  ];
};

const initProfileMissing = (
  location: { pathname: string },
  session: Auth.Session
): [ProfileMissing, cmd.Cmd<Msg>] => {
  const [childModel, childCmd] = ProfileMissingApp.init(location, session);
  return [
    { type: "ProfileMissing", child: childModel },
    pipe(
      childCmd,
      cmd.map((msg) => ({ type: "ProfileMissingAppMsg", msg }))
    ),
  ];
};

/* 
  
  
Update  
  
  
*/

export type Msg =
  | { type: "LocationChanged"; location: { pathname: string } }
  | { type: "ProfileFound"; profile: Profile.Profile }
  | { type: "ProfileMissing" }
  | { type: "ProfileFoundAppMsg"; msg: ProfileFoundApp.Msg }
  | { type: "ProfileMissingAppMsg"; msg: ProfileMissingApp.Msg };

export const update = (
  location: { pathname: string },
  session: Auth.Session,
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Loading":
      return updateLoading(location, session, msg, model);

    case "ProfileFound":
      return updateProfileFound(session, msg, model);

    case "ProfileMissing":
      return updateProfileMissing(location, session, msg, model);
  }
};

export const updateLoading = (
  location: { pathname: string },
  session: Auth.Session,
  msg: Msg,
  model: Loading
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ProfileFound":
      return initProfileFound(location, msg.profile);

    case "ProfileMissing":
      return initProfileMissing(location, session);

    case "LocationChanged":
      return [model, cmd.none];

    case "ProfileMissingAppMsg":
      return [model, cmd.none];

    case "ProfileFoundAppMsg":
      return [model, cmd.none];
  }
};

export const updateProfileFound = (
  session: Auth.Session,
  msg: Msg,
  model: ProfileFound
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ProfileFound":
      return [{ ...model, profile: msg.profile }, cmd.none];

    case "ProfileFoundAppMsg":
      const [childModel, childCmd] = ProfileFoundApp.update(
        model.profile,
        msg.msg,
        model.child
      );
      return [
        { ...model, child: childModel },
        pipe(
          childCmd,
          cmd.map((msg) => ({ type: "ProfileFoundAppMsg", msg }))
        ),
      ];

    case "LocationChanged": {
      const [childModel, childCmd] = ProfileFoundApp.update(
        model.profile,
        msg,
        model.child
      );
      return [
        { ...model, child: childModel },
        pipe(
          childCmd,
          cmd.map((msg) => ({ type: "ProfileFoundAppMsg", msg }))
        ),
      ];
    }

    case "ProfileMissing":
      return initProfileMissing(location, session);

    case "ProfileMissingAppMsg":
      return [model, cmd.none];
  }
};

export const updateProfileMissing = (
  location: { pathname: string },
  session: Auth.Session,
  msg: Msg,
  model: ProfileMissing
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LocationChanged":
      return [model, cmd.none];

    case "ProfileFound":
      return initProfileFound(location, msg.profile);

    case "ProfileFoundAppMsg":
      return [model, cmd.none];

    case "ProfileMissing":
      return [model, cmd.none];

    case "ProfileMissingAppMsg":
      const [childModel, childCmd] = ProfileMissingApp.update(
        session,
        msg.msg,
        model.child
      );

      return [
        { ...model, child: childModel },
        pipe(
          childCmd,
          cmd.map((msg) => ({ type: "ProfileMissingAppMsg", msg }))
        ),
      ];
  }
};

/* 



View



*/

export const view = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "Loading":
      return () => <View.LoadingPage />;

    case "ProfileFound":
      return pipe(
        ProfileFoundApp.view(model.profile, model.child),
        react.map((msg) => ({ type: "ProfileFoundAppMsg", msg }))
      );

    case "ProfileMissing":
      return pipe(
        ProfileMissingApp.view(model.child),
        react.map((msg) => ({ type: "ProfileMissingAppMsg", msg }))
      );
  }
};

/* 



Subscriptions



*/

const profileToMsg = option.fold<Profile.Profile, Msg>(
  () => ({ type: "ProfileMissing" }),
  (profile) => ({ type: "ProfileFound", profile })
);

export const subscriptions = (
  session: Auth.Session,
  model: Model
): sub.Sub<Msg> => {
  return sub.map(profileToMsg)(Profile.subscription(session));
};
