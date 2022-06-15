import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as RemoteData from "Framework/RemoteData";
import { attempt } from "Framework/Task";
import * as Conversation from "./Conversation";
import * as Profile from "./Profile";

//
//
//
// Model
//
//
//

type Problem = { message: string };

export type Model = {
  profile: {
    [userId: string]: RemoteData.RemoteData<Problem, Profile.Profile>;
  };
  conversation: {
    [conversationId: string]: Conversation.Conversation;
  };
  profiles_conversations: {
    [id: string]: {
      userId: string;
      conversationId: string;
    };
  };
};

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
  | { type: "EditedProfile"; profile: Profile.Profile }
  | { type: "DeletedProfile"; userId: string }
  | { type: "EditProfile"; userId: string; edits: Partial<Profile.Profile> }
  | { type: "DeleteProfile"; userId: string }
  | { type: "GotProblem" }
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
            either.fold<{}, Profile.Profile, Msg>(
              () => ({ type: "GotProblem" }),
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

    case "GotProblem":
      return [model, cmd.none];
  }
};

//
//
//
//
//
//
//
