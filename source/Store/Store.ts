import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as RemoteData from "Framework/RemoteData";
import { attempt } from "Framework/Task";
import { exhaustive } from "Utility";
import * as Conversation from "./Conversation";
import * as Profile from "./Profile";

//
//
//
// Model
//
//
//

export type Model = {
  profile: {
    [id: string]: StoreData<Profile.Profile>;
  };
  conversation: {
    [id: string]: StoreData<Conversation.Conversation>;
  };
  profiles_conversations: {
    [id: string]: StoreData<ProfilesConversations>;
  };
};

type Problem = { message: string };

type StoreData<T> = RemoteData.RemoteData<Problem, T>;

type ProfilesConversations = { userId: string; conversationId: string };

export const init: Model = {
  profile: {},
  conversation: {},
  profiles_conversations: {},
};

//
//
//
// Msg
//
//
//

export type Msg =
  | { type: "GetProfile"; userId: string }
  | { type: "GotProfile"; profile: Profile.Profile }
  | { type: "GotProfileProblem"; userId: string; problem: Problem }
  | { type: "EditedProfile"; profile: Profile.Profile }
  | { type: "DeletedProfile"; userId: string }
  | { type: "EditProfile"; userId: string; edits: Partial<Profile.Profile> }
  | { type: "DeleteProfile"; userId: string }
  | {
      type: "CreateProfile";
      profile: {
        userId: string;
        name: string;
        username: string;
        avatarUrl: string;
      };
    }
  | { type: "CreatedProfile"; profile: Profile.Profile };

export type GroupedMsg = Msg & { group: "Store" };

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "CreateProfile":
      return [model, cmd.none];

    case "CreatedProfile":
      return [model, cmd.none];

    case "DeleteProfile":
      return [model, cmd.none];

    case "DeletedProfile":
      return [model, cmd.none];

    case "EditProfile":
      return [model, cmd.none];

    case "EditedProfile":
      return [model, cmd.none];

    case "GetProfile":
      return [
        {
          ...model,
          profile: {
            ...model.profile,
            [msg.userId]: RemoteData.Loading,
          },
        },
        pipe(
          Profile.load(msg),
          attempt(
            either.fold<Problem, Profile.Profile, Msg>(
              (problem) => ({
                type: "GotProfileProblem",
                problem,
                userId: msg.userId,
              }),
              (profile) => ({ type: "GotProfile", profile })
            )
          )
        ),
      ];

    case "GotProfile":
      return [
        {
          ...model,
          profile: {
            ...model.profile,
            [msg.profile.userId]: RemoteData.Success(msg.profile),
          },
        },
        cmd.none,
      ];

    case "GotProfileProblem":
      return [
        {
          ...model,
          profile: {
            ...model.profile,
            [msg.userId]: RemoteData.Failure(msg.problem),
          },
        },
        cmd.none,
      ];

    default:
      return exhaustive(msg);
  }
};

//
//
//
//
//
//
//

export const toProfile = (
  model: Model,
  userId: string
): StoreData<Profile.Profile> => {
  return model.profile[userId] ?? RemoteData.NotAsked;
};
