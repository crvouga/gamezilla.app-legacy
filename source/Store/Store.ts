import { pipe } from "fp-ts/lib/function";
import { cmd } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as RemoteData from "Framework/RemoteData";
import { perform } from "Framework/Task";
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
      const remoteDataProfile = toProfile(msg.userId, model);

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
          return [model, cmd.none];
      }

    case "Profile/Get":
      return [
        mapProfile(msg.userId, () => RemoteData.Loading, model),
        loadProfile(msg.userId),
      ];

    case "Profile/Got":
      return [
        mapProfile(msg.userId, () => RemoteData.fromResult(msg.result), model),
        cmd.none,
      ];

    case "Profile/DeleteForever": {
      const remoteDataProfile = toProfile(msg.userId, model);

      switch (remoteDataProfile.type) {
        case "Success":
          const previous = remoteDataProfile.value;

          return [
            mapProfile(msg.userId, () => RemoteData.NotAsked, model),
            pipe(
              Profile.deleteForever(msg.userId),
              perform((result) =>
                Profile.DeletedForever(msg.userId, previous, result)
              )
            ),
          ];

        default:
          return [model, cmd.none];
      }
    }

    case "Profile/DeletedForever": {
      const result = msg.result;

      switch (result.type) {
        case "Err":
          return [
            mapProfile(
              msg.userId,
              () => RemoteData.Success(msg.previous),
              model
            ),
            cmd.none,
          ];

        case "Ok":
          return [
            mapProfile(msg.userId, () => RemoteData.NotAsked, model),
            loadProfile(msg.userId),
          ];
      }
    }

    case "Profile/Create":
      return [
        mapProfile(msg.profile.userId, () => RemoteData.Loading, model),
        pipe(
          Profile.create(msg.profile),
          perform((result) => Profile.Created(msg.profile.userId, result))
        ),
      ];

    case "Profile/Created":
      return [
        mapProfile(msg.userId, () => RemoteData.fromResult(msg.result), model),
        cmd.none,
      ];

    case "Profile/Search":
      return [
        model,
        pipe(
          Profile.search({ nameOrUsername: msg.searchText }),
          perform((result) => Profile.Searched(result))
        ),
      ];

    case "Profile/Searched":
      return [{ ...model, profile: { ...model.profile } }, cmd.none];

    default:
      return exhaustive(msg);
  }
};

const loadProfile = (userId: string) => {
  return pipe(
    Profile.load({ userId }),
    perform((result) => Profile.Got(userId, result))
  );
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
      [userId]: mapper(toProfile(userId, model)),
    },
  };
};

export const toProfile = (userId: string, model: Model): RemoteDataProfile => {
  return model.profile[userId] ?? RemoteData.NotAsked;
};
