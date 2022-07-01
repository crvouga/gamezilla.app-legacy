import * as Route from "Route";
import * as Snackbar from "Snackbar";
import * as Supabase from "Supabase";
import { Cmd, RemoteData, Result, Task, pipe } from "Core";
import produce from "immer";
import { definitions } from "supabase-types";
import * as Types from "./Types";
import { rowToProfile } from "./Profile";
import {
  Message,
  Problem,
  Profile,
  ProfilesConversations,
  Store,
} from "./Types";

//
//
//
// Model
//
//
//

export type Conversation = Types.Conversation;

//
//
//
// Msg
//
//
//

export type Msg = Inserted | FindManyResulted | FindOneResulted;

export type Action = Insert | FindManyByUserId | FindOne;

export const Insert = (creatorId: string, userIds: string[]) => {
  return {
    type: "Conversation/Insert",
    group: "Store",
    entity: "Conversation",
    userIds,
    creatorId,
  } as const;
};
export type Insert = ReturnType<typeof Insert>;

export const Inserted = (
  userIds: string[],
  result: Result.Result<
    Problem,
    {
      conversation: Conversation;
      profilesConversations: ProfilesConversations[];
    }
  >,
) => {
  return {
    type: "Conversation/Inserted",
    group: "Store",
    entity: "Conversation",
    userIds,
    result,
  } as const;
};
export type Inserted = ReturnType<typeof Inserted>;

export const FindManyByUserId = (userId: string) => {
  return {
    type: "Conversation/FindManyByUserId",
    group: "Store",
    entity: "Conversation",
    userId,
  } as const;
};
export type FindManyByUserId = ReturnType<typeof FindManyByUserId>;

type FindResult = Result.Result<
  Problem,
  {
    conversations: Conversation[];
    profiles: Profile[];
    profilesConversations: ProfilesConversations[];
  }
>;

export const FindManyByUserIdResulted = (
  userId: string,
  result: FindResult,
) => {
  return {
    type: "Conversation/FindManyByUserIdResulted",
    group: "Store",
    entity: "Conversation",
    result,
    userId,
  } as const;
};
export type FindManyResulted = ReturnType<typeof FindManyByUserIdResulted>;

export const FindOne = (conversationId: string) => {
  return {
    type: "Conversation/FindOne",
    group: "Store",
    entity: "Conversation",
    conversationId,
  } as const;
};
export type FindOne = ReturnType<typeof FindOne>;

export const FindOneResulted = (
  conversationId: string,
  result: Result.Result<
    Problem,
    { conversation: Conversation; profiles: Profile[]; messages: Message[] }
  >,
) => {
  return {
    type: "Conversation/FindOneResulted",
    group: "Store",
    entity: "Conversation",
    conversationId,
    result,
  } as const;
};
export type FindOneResulted = ReturnType<typeof FindOneResulted>;

//
//
//
// Update
//
//
//

type OutAction = Snackbar.Action;

export const update = (
  msg: Msg,
  model: Store,
): [Store, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "Conversation/FindOneResulted": {
      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindOne[msg.conversationId] = pipe(
          msg.result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((data) => ({
            conversation: data.conversation.conversationId,
            profile: data.profiles.map((item) => item.userId),
            message: data.messages.map((item) => item.messageId),
          })),
        );
        if (msg.result.type === "Ok") {
          const data = msg.result.value;
          model.Conversation[data.conversation.conversationId] =
            data.conversation;
          data.messages.forEach((item) => {
            model.Message[item.messageId] = item;
          });
          data.profiles.forEach((item) => {
            model.Profile[item.userId] = item;
            const profileConversation = {
              userId: item.userId,
              conversationId: data.conversation.conversationId,
            };
            model.ProfilesConversations[
              Types.toProfilesConversationsId(profileConversation)
            ] = profileConversation;
          });
        }
      });

      return [modelNew, Cmd.None, []];
    }

    case "Conversation/FindManyByUserIdResulted": {
      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindManyByUserId[msg.userId] = pipe(
          msg.result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((data) => ({
            conversation: data.conversations.map((item) => item.conversationId),
            profile: data.profiles.map((item) => item.userId),
            profilesConversations: data.profilesConversations.map(
              Types.toProfilesConversationsId,
            ),
          })),
        );

        if (msg.result.type === "Ok") {
          const data = msg.result.value;
          data.conversations.forEach((item) => {
            model.Conversation[item.conversationId] = item;
          });

          data.profiles.forEach((item) => {
            model.Profile[item.userId] = item;
          });

          data.profilesConversations.forEach((item) => [
            (model.ProfilesConversations[
              Types.toProfilesConversationsId(item)
            ] = item),
          ]);
        }
      });

      return [modelNew, Cmd.None, []];
    }

    case "Conversation/Inserted":
      const modelNew = produce(model, (model) => {
        model.mutations.Conversation.GetElseCreate = pipe(
          msg.result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((value) => value.conversation.conversationId),
        );

        if (msg.result.type === "Ok") {
          const data = msg.result.value;

          model.Conversation[data.conversation.conversationId] =
            data.conversation;

          data.profilesConversations.forEach((item) => {
            model.ProfilesConversations[Types.toProfilesConversationsId(item)] =
              item;
          });
        }
      });

      const cmdNew: Cmd.Cmd<Msg> =
        msg.result.type === "Ok"
          ? Route.replace({
              type: "ChatConversation",
              conversationId: msg.result.value.conversation.conversationId,
            })
          : Cmd.None;

      return [modelNew, cmdNew, []];
  }
};

export const runAction = (
  action: Action,
  model: Store,
): [Store, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "Conversation/FindOne": {
      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindOne[action.conversationId] =
          RemoteData.Loading;
      });
      return [
        modelNew,
        pipe(
          findOneById({ conversationId: action.conversationId }),
          Cmd.fromTask((result) =>
            FindOneResulted(action.conversationId, result),
          ),
        ),
      ];
    }

    case "Conversation/FindManyByUserId": {
      const query =
        model.queries.Conversation.FindManyByUserId[action.userId] ??
        RemoteData.NotAsked;

      if (query.type === "Success") {
        return [model, Cmd.None];
      }

      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindManyByUserId[action.userId] =
          RemoteData.Loading;
      });

      return [
        modelNew,
        pipe(
          findManyByUserId({ userId: action.userId }),
          Cmd.fromTask((result) =>
            FindManyByUserIdResulted(action.userId, result),
          ),
        ),
      ];
    }

    case "Conversation/Insert":
      const modelNew = produce(model, (model) => {
        model.mutations.Conversation.GetElseCreate = RemoteData.Loading;
      });

      return [
        modelNew,

        pipe(
          insert({
            creatorId: action.creatorId,
            userIds: action.userIds,
          }),
          Cmd.fromTask((result) => Inserted(action.userIds, result)),
        ),
      ];
  }
};

//
//
//
// Selectors
//
//
//

export const toConversation = (
  conversationId: string,
  store: Store,
): {
  conversationId: string;
  profiles: Profile[];
} => {
  const profiles = Object.values(store.ProfilesConversations)
    .filter((row) => row.conversationId === conversationId)
    .flatMap((row) => {
      const maybeProfile = store.Profile[row.userId];
      if (maybeProfile) {
        return [maybeProfile];
      }
      return [];
    });

  return {
    conversationId: conversationId,
    profiles,
  };
};

//
//
//
// Data Access
//
//
//

const fromRow = (row: definitions["conversation"]): Conversation => {
  return {
    conversationId: row.id,
  };
};

const findOneById =
  ({
    conversationId,
  }: {
    conversationId: string;
  }): Task.Task<
    Result.Result<
      Problem,
      {
        conversation: Conversation;
        profiles: Profile[];
        messages: Message[];
      }
    >
  > =>
  async () => {
    const matchConversationIdResponse = await Supabase.client
      .from<definitions["profiles_conversations"]>("profiles_conversations")
      .select("*")
      .eq("conversation_id", conversationId);

    if (matchConversationIdResponse.error) {
      return Result.Err({ message: matchConversationIdResponse.error.message });
    }

    const userIds = Array.from(
      new Set(matchConversationIdResponse.data.map((item) => item.user_id)),
    );

    const profilesResponse = await Supabase.client
      .from<definitions["profile"]>("profile")
      .select("*")
      .in("id", userIds);

    if (profilesResponse.error) {
      return Result.Err({ message: profilesResponse.error.message });
    }

    const messagesResponse = await Supabase.client
      .from<definitions["message"]>("message")
      .select("*")
      .eq("conversation_id", conversationId);

    if (messagesResponse.error) {
      return Result.Err({ message: messagesResponse.error.message });
    }

    return Result.Ok({
      conversation: {
        conversationId,
      },
      profiles: profilesResponse.data.map(rowToProfile),
      messages: messagesResponse.data.map((item) => ({
        messageId: item.id,
        message: item.message,
        userId: item.user_id,
        conversationId: item.conversation_id,
      })),
    });
  };

const findManyByUserId =
  ({
    userId,
  }: {
    userId: string;
  }): Task.Task<
    Result.Result<
      Problem,
      {
        conversations: Conversation[];
        profiles: Profile[];
        profilesConversations: ProfilesConversations[];
      }
    >
  > =>
  async () => {
    const matchUserIdResponse = await Supabase.client
      .from<definitions["profiles_conversations"]>("profiles_conversations")
      .select("*")
      .match({ user_id: userId });

    if (matchUserIdResponse.error) {
      return Result.Err({
        message: matchUserIdResponse.error.message,
      });
    }

    const conversationResponse = await Supabase.client
      .from<definitions["conversation"]>("conversation")
      .select("*")
      .in(
        "id",
        matchUserIdResponse.data.map((item) => item.conversation_id),
      );

    if (conversationResponse.error) {
      return Result.Err({ message: conversationResponse.error.message });
    }

    const matchConversationIdResponse = await Supabase.client
      .from<definitions["profiles_conversations"]>("profiles_conversations")
      .select("*")
      .in(
        "conversation_id",
        conversationResponse.data.map((item) => item.id),
      );

    if (matchConversationIdResponse.error) {
      return Result.Err({ message: matchConversationIdResponse.error.message });
    }

    const profileResponse = await Supabase.client
      .from<definitions["profile"]>("profile")
      .select("*")
      .in("id", [
        ...new Set(
          matchConversationIdResponse.data.map((item) => item.user_id),
        ),
      ]);

    if (profileResponse.error) {
      console.log("ERROR", profileResponse.error);
      return Result.Err({ message: profileResponse.error.message });
    }

    return Result.Ok({
      profilesConversations: [
        ...matchUserIdResponse.data,
        ...matchConversationIdResponse.data,
      ].map((item) => ({
        userId: item.user_id,
        conversationId: item.conversation_id,
      })),
      conversations: conversationResponse.data.map((item) => ({
        conversationId: item.id,
      })),
      profiles: profileResponse.data.map(rowToProfile),
    });
  };

const insert =
  ({
    creatorId,
    userIds,
  }: {
    creatorId: string;
    userIds: string[];
  }): Task.Task<
    Result.Result<
      Problem,
      {
        conversation: Conversation;
        profilesConversations: ProfilesConversations[];
      }
    >
  > =>
  async () => {
    const { data: conversationData, error: conversationError } =
      await Supabase.client
        .from<definitions["conversation"]>("conversation")
        .insert({})
        .single();

    if (conversationError) {
      return Result.Err({ message: conversationError.message });
    }

    const conversation = fromRow(conversationData);

    const {
      data: profilesConversationsData,
      error: profilesConversationsError,
    } = await Supabase.client
      .from<definitions["profiles_conversations"]>("profiles_conversations")
      .insert(
        [...userIds, creatorId].map((userId) => ({
          conversation_id: conversation.conversationId,
          user_id: userId,
        })),
      );

    if (profilesConversationsError) {
      const rollbackResponse = await Supabase.client
        .from<definitions["conversation"]>("conversation")
        .delete()
        .eq("id", conversation.conversationId);

      if (rollbackResponse.error) {
        return Result.Err({
          message: `${profilesConversationsError.message}. ${rollbackResponse.error}`,
        });
      }

      return Result.Err({ message: profilesConversationsError.message });
    }

    const profilesConversations = profilesConversationsData.map(
      ({ user_id, conversation_id }) => ({
        userId: user_id,
        conversationId: conversation_id,
      }),
    );

    return Result.Ok({ conversation, profilesConversations });
  };
