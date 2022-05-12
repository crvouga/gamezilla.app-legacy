import * as React from "react";
import * as ProfileMissingApp from "./ProfileMissingApp";
import * as ProfileFoundApp from "./ProfileFoundApp";
import * as Profile from "../Profile";
import { cmd, react, sub } from "../Framework";
import * as View from "../View";
import * as Session from "../Session";
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

// //
// // dependencies
// //

// type Dependencies = {
//   location: { pathname: string };
//   session: Session.Session;
// };

// //
// // init
// //

// export const init = ({ session }: Dependencies): [Model, cmd.Cmd<Msg>] => {
//   return [
//     { type: "Loading" },
//     Profile.fetch<Msg>({
//       userId: session.userId,
//       onSuccess: (profile) => ({ type: "ProfileFound", profile }),
//       onFailure: () => ({ type: "ProfileMissing" }),
//     }),
//   ];
// };

// //
// //
// //
// //
// // Update
// //
// //
// //
// //

// export type Msg =
//   | { type: "LocationChanged"; location: { pathname: string } }
//   | { type: "ProfileFound"; profile: Profile.Profile }
//   | { type: "ProfileMissing" }
//   | { type: "ProfileFoundAppMsg"; msg: ProfileFoundApp.Msg }
//   | { type: "ProfileMissingAppMsg"; msg: ProfileMissingApp.Msg };

// export const update = (
//   deps: Dependencies,
//   msg: Msg,
//   model: Model
// ): [Model, cmd.Cmd<Msg>] => {
//   switch (model.type) {
//     case "Loading":
//       return updateLoading(deps, msg, model);

//     case "ProfileFound":
//       return updateProfileFound(deps, msg, model);

//     case "ProfileMissing":
//       return updateProfileMissing(deps, msg, model);
//   }
// };

// export const updateLoading = (
//   { location, session }: Dependencies,
//   msg: Msg,
//   model: Loading
// ): [Model, cmd.Cmd<Msg>] => {
//   switch (msg.type) {
//     case "ProfileFound":
//       return toProfileFound(
//         msg.profile,
//         ProfileFoundApp.init({ location, profile: msg.profile })
//       );

//     case "ProfileMissing":
//       return toProfileMissing(ProfileMissingApp.init({ location, session }));

//     case "LocationChanged":
//       return [model, cmd.none];

//     case "ProfileMissingAppMsg":
//       return [model, cmd.none];

//     case "ProfileFoundAppMsg":
//       return [model, cmd.none];
//   }
// };

// export const updateProfileFound = (
//   { location, session }: Dependencies,
//   msg: Msg,
//   model: ProfileFound
// ): [Model, cmd.Cmd<Msg>] => {
//   const profileFoundDeps = { location, session, profile: model.profile };

//   switch (msg.type) {
//     case "ProfileFound":
//       return [
//         { type: "ProfileFound", profile: msg.profile, child: model.child },
//         cmd.none,
//       ];

//     case "ProfileFoundAppMsg":
//       return toProfileFound(
//         model.profile,
//         ProfileFoundApp.update(profileFoundDeps, msg.msg, model.child)
//       );

//     case "LocationChanged": {
//       return toProfileFound(
//         model.profile,
//         ProfileFoundApp.update(profileFoundDeps, msg, model.child)
//       );
//     }

//     case "ProfileMissing":
//       return toProfileMissing(ProfileMissingApp.init(profileFoundDeps));

//     case "ProfileMissingAppMsg":
//       return [model, cmd.none];
//   }
// };

// export const updateProfileMissing = (
//   { location, session }: Dependencies,
//   msg: Msg,
//   model: ProfileMissing
// ): [Model, cmd.Cmd<Msg>] => {
//   switch (msg.type) {
//     case "LocationChanged":
//       return [model, cmd.none];

//     case "ProfileFound":
//       return toProfileFound(
//         msg.profile,
//         ProfileFoundApp.init({ location, profile: msg.profile })
//       );

//     case "ProfileFoundAppMsg":
//       return [model, cmd.none];

//     case "ProfileMissing":
//       return [model, cmd.none];

//     case "ProfileMissingAppMsg":
//       return toProfileMissing(
//         ProfileMissingApp.update({ session, location }, msg.msg, model.child)
//       );
//   }
// };

// //
// //
// //
// //
// // View
// //
// //
// //
// //

// export const view = (model: Model): react.Html<Msg> => {
//   switch (model.type) {
//     case "Loading":
//       return () => <View.LoadingPage />;

//     case "ProfileFound":
//       return pipe(
//         ProfileFoundApp.view({ profile: model.profile }, model.child),
//         react.map((msg) => ({ type: "ProfileFoundAppMsg", msg }))
//       );

//     case "ProfileMissing":
//       return pipe(
//         ProfileMissingApp.view(model.child),
//         react.map((msg) => ({ type: "ProfileMissingAppMsg", msg }))
//       );
//   }
// };

// //
// //
// //
// //
// // Subscriptions
// //
// //
// //
// //

// const profileToMsg = option.fold<Profile.Profile, Msg>(
//   () => ({ type: "ProfileMissing" }),
//   (profile) => ({ type: "ProfileFound", profile })
// );

// export const subscriptions = (
//   session: Session.Session,
//   model: Model
// ): sub.Sub<Msg> => {
//   return sub.map(profileToMsg)(Profile.subscription(session));
// };

// //
// //
// // helpers
// //
// //

// const toProfileMissing = ([childModel, childCmd]: [
//   ProfileMissingApp.Model,
//   cmd.Cmd<ProfileMissingApp.Msg>
// ]): [Model, cmd.Cmd<Msg>] => {
//   return [
//     { type: "ProfileMissing", child: childModel },
//     pipe(
//       childCmd,
//       cmd.map((msg) => ({ type: "ProfileMissingAppMsg", msg }))
//     ),
//   ];
// };

// const toProfileFound = (
//   profile: Profile.Profile,
//   [childModel, childCmd]: [ProfileFoundApp.Model, cmd.Cmd<ProfileFoundApp.Msg>]
// ): [Model, cmd.Cmd<Msg>] => {
//   return [
//     { type: "ProfileFound", profile, child: childModel },
//     pipe(
//       childCmd,
//       cmd.map((msg) => ({ type: "ProfileFoundAppMsg", msg }))
//     ),
//   ];
// };
