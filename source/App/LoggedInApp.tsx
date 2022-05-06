import * as React from "react";
import * as ProfileMissingApp from "./ProfileMissingApp";
import * as ProfileFoundApp from "./ProfileFoundApp";
import * as Profile from "../Profile";
import { cmd, react, sub } from "../Framework";
import * as View from "../View";
import * as Auth from "../Auth";
import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";

/* 


Model


*/

export type Model = Loading | ProfileFound | ProfileMissing;

type Loading = { type: "Loading" };

type ProfileMissing = { type: "ProfileMissing" };

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
  url: string,
  profile: Profile.Profile
): [ProfileFound, cmd.Cmd<Msg>] => {
  const [childModel, childCmd] = ProfileFoundApp.init(url, profile);

  return [{ type: "ProfileFound", profile, child: childModel }, cmd.none];
};

const initProfileMissing = (): [ProfileMissing, cmd.Cmd<Msg>] => {
  return [{ type: "ProfileMissing" }, cmd.none];
};

/* 
  
  
Update  
  
  
*/

export type Msg =
  | { type: "ProfileFound"; profile: Profile.Profile }
  | { type: "ProfileMissing" }
  | { type: "ProfileFoundAppMsg"; msg: ProfileFoundApp.Msg };

export const update = (
  url: string,
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Loading":
      return updateLoading(url, msg, model);

    case "ProfileFound":
      return updateProfileFound(msg, model);

    case "ProfileMissing":
      return updateProfileMissing(msg, model);
  }
};

export const updateLoading = (
  url: string,
  msg: Msg,
  model: Loading
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ProfileFound":
      return initProfileFound(url, msg.profile);

    case "ProfileMissing":
      return initProfileMissing();

    case "ProfileFoundAppMsg":
      return [model, cmd.none];
  }
};

export const updateProfileFound = (
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

    case "ProfileMissing":
      return [model, cmd.none];
  }
};

export const updateProfileMissing = (
  msg: Msg,
  model: ProfileMissing
): [Model, cmd.Cmd<Msg>] => {
  return [model, cmd.none];
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
      return () => <>profile missing</>;
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
