import { either } from "fp-ts";
import { Either } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { cmd } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as RemoteData from "Framework/RemoteData";
import { Result } from "Framework/Result";
import { attempt, perform } from "Framework/Task";
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
    [id: string]: RemoteDataProfile;
  };
  conversation: {
    [id: string]: StoreData<Conversation.Conversation>;
  };
  profiles_conversations: {
    [id: string]: StoreData<ProfilesConversations>;
  };
};

type RemoteDataProfile = RemoteData.RemoteData<Problem, Profile.Profile>;

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

export type Msg = Profile.Msg;

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
    case "Profile/Edit":
      const remoteDataProfile = toProfile(model, msg.userId);

      switch (remoteDataProfile.type) {
        case "Success":
          const prev = remoteDataProfile.value;
          const next = { ...prev, ...msg.edits };
          return [
            mapProfile(
              msg.userId,
              RemoteData.map(() => next),
              model
            ),
            pipe(
              Profile.edit(msg.userId, msg.edits),
              perform((result) => Profile.Edited(msg.userId, prev, result))
            ),
          ];

        default:
          return [model, cmd.none];
      }

    case "Profile/Edited":
      const result = msg.result;

      switch (result.type) {
        case "Err":
          return [
            mapProfile(
              msg.userId,
              RemoteData.map(() => msg.previous),
              model
            ),
            cmd.none,
          ];

        case "Ok":
          return [
            mapProfile(
              msg.userId,
              RemoteData.map(() => result.value),
              model
            ),
            cmd.none,
          ];
      }

    case "Profile/Get":
      return [
        mapProfile(msg.userId, () => RemoteData.Loading, model),
        pipe(
          Profile.load(msg),
          perform((result) => Profile.Got(msg.userId, result))
        ),
      ];

    case "Profile/Got":
      return [
        mapProfile(msg.userId, () => RemoteData.fromResult(msg.result), model),
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

const mapProfile = (
  userId: string,
  mapper: (remoteDataProfile: RemoteDataProfile) => RemoteDataProfile,
  model: Model
): Model => {
  return {
    ...model,
    profile: {
      ...model.profile,
      [userId]: mapper(toProfile(model, userId)),
    },
  };
};

export const toProfile = (model: Model, userId: string): RemoteDataProfile => {
  return model.profile[userId] ?? RemoteData.NotAsked;
};
