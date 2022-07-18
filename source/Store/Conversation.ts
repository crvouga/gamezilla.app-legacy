import produce from "immer";
import * as Route from "../Route";
import * as Supabase from "../Supabase";
import * as Types from "./Types";
import { Cmd, Option, RemoteData, Result, Task, pipe } from "../Core";
import { definitions } from "../supabase-types";
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

export type Msg =
  | FindOneElseInsertResulted
  | FindManyResulted
  | FindOneResulted;

export type Action = FindOneElseInsert | FindManyByUserId | FindOne;

type FindOneResult = Result.Result<
  Problem,
  {
    conversation: Conversation;
    profiles: Profile[];
    profilesConversations: ProfilesConversations[];
    messages: Message[];
  }
>;

export const FindOneElseInsert = (creatorId: string, userIds: string[]) => {
  return {
    type: "Conversation/FindOneElseInsert",
    group: "Store",
    entity: "Conversation",
    userIds,
    creatorId,
  } as const;
};
export type FindOneElseInsert = ReturnType<typeof FindOneElseInsert>;

export const FindOneElseInsertResulted = (
  userIds: string[],
  result: FindOneResult,
) => {
  return {
    type: "Conversation/FindOneElseInsertResulted",
    group: "Store",
    entity: "Conversation",
    userIds,
    result,
  } as const;
};
export type FindOneElseInsertResulted = ReturnType<
  typeof FindOneElseInsertResulted
>;

export const FindManyByUserId = (userId: string) => {
  return {
    type: "Conversation/FindManyByUserId",
    group: "Store",
    entity: "Conversation",
    userId,
  } as const;
};
export type FindManyByUserId = ReturnType<typeof FindManyByUserId>;

export const FindManyByUserIdResulted = (
  userId: string,
  result: Result.Result<
    Problem,
    {
      conversations: Conversation[];
      profiles: Profile[];
      profilesConversations: ProfilesConversations[];
    }
  >,
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
  result: FindOneResult,
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

export const update = (msg: Msg, model: Store): [Store, Cmd.Cmd<Msg>] => {
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

      return [modelNew, Cmd.None];
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

      return [modelNew, Cmd.None];
    }

    case "Conversation/FindOneElseInsertResulted":
      const modelNew = produce(model, (model) => {
        model.mutations.Conversation.FindElseInsert = pipe(
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

      // todo put this logic elsewhere
      const cmdNew: Cmd.Cmd<Msg> =
        msg.result.type === "Ok"
          ? Route.push({
              type: "ChatConversation",
              conversationId: msg.result.value.conversation.conversationId,
            })
          : Cmd.None;

      return [modelNew, cmdNew];
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

    case "Conversation/FindOneElseInsert": {
      const modelNew = produce(model, (model) => {
        model.mutations.Conversation.FindElseInsert = RemoteData.Loading;
      });

      const userIds = [action.creatorId, ...action.userIds];

      return [
        modelNew,
        pipe(
          findOneElseInsert({ userIds }),
          Cmd.fromTask((result) =>
            FindOneElseInsertResulted(action.userIds, result),
          ),
        ),
      ];
    }
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
  messages: Message[];
} => {
  const profiles = Object.values(store.ProfilesConversations)
    .filter((row) => row.conversationId === conversationId)
    .map((item) => store.Profile[item.userId])
    .flatMap((item) => (item ? [item] : []));

  const messages = Object.values(store.Message).filter(
    (item) => item.conversationId === conversationId,
  );

  return {
    conversationId: conversationId,
    profiles,
    messages,
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
  ({ conversationId }: { conversationId: string }): Task.Task<FindOneResult> =>
  async () => {
    const matchConversationIdResponse = await Supabase.client
      .from<definitions["users_conversations"]>("users_conversations")
      .select("*")
      .eq("conversation_id", conversationId);

    if (matchConversationIdResponse.error) {
      return Result.Err({ message: matchConversationIdResponse.error.message });
    }

    const userIds = Array.from(
      new Set(matchConversationIdResponse.data.map((item) => item.user_id)),
    );

    const profilesResponse = await Supabase.client
      .from<definitions["user_profile"]>("user_profile")
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
      profilesConversations: profilesResponse.data.map((item) => ({
        conversationId,
        userId: item.id,
      })),
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
      .from<definitions["users_conversations"]>("users_conversations")
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
      .from<definitions["users_conversations"]>("users_conversations")
      .select("*")
      .in(
        "conversation_id",
        conversationResponse.data.map((item) => item.id),
      );

    if (matchConversationIdResponse.error) {
      return Result.Err({ message: matchConversationIdResponse.error.message });
    }

    const profileResponse = await Supabase.client
      .from<definitions["user_profile"]>("user_profile")
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

const findUniqueByUserIds =
  ({
    userIds,
  }: {
    userIds: string[];
  }): Task.Task<Result.Result<Problem, Option.Option<string>>> =>
  async () => {
    const usersConversationsResponse = await Supabase.client
      .from<definitions["users_conversations"]>("users_conversations")
      .select("*")
      .in("user_id", userIds);

    if (usersConversationsResponse.error) {
      return Result.Err({
        message: usersConversationsResponse.error.message,
      });
    }

    // todo. this should be in the database query
    const userIdsbyConversationId = usersConversationsResponse.data.reduce<{
      [conversationId: string]: { [userId: string]: string };
    }>(
      (byId, item) => ({
        ...byId,
        [item.conversation_id]: {
          ...(byId[item.conversation_id] ?? {}),
          [item.user_id]: item.user_id,
        },
      }),
      {},
    );

    console.log({ userIdsbyConversationId, userIds });
    const conversationId = Object.entries(userIdsbyConversationId)
      .filter(
        (entry) =>
          userIds.every((userId) => userId in entry[1]) &&
          userIds.length === Object.values(entry[1]).length,
      )
      .map((entry) => entry[0])[0];

    return Result.Ok(Option.fromNullable(conversationId));
  };

const findOneElseInsert =
  ({ userIds }: { userIds: string[] }): Task.Task<FindOneResult> =>
  async () => {
    const findIdResult = await findUniqueByUserIds({ userIds })();

    if (findIdResult.type === "Err") {
      return findIdResult;
    }
    if (findIdResult.value.type === "None") {
      const insertResult = await insert({ userIds })();

      if (insertResult.type === "Err") {
        return insertResult;
      }

      const conversationId = insertResult.value.conversation.conversationId;

      return findOneById({ conversationId })();
    }

    const conversationId = findIdResult.value.value;

    return findOneById({ conversationId })();
  };

const insert =
  ({
    userIds,
  }: {
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
    const conversationResponse = await Supabase.client
      .from<definitions["conversation"]>("conversation")
      .insert({})
      .single();

    console.log({ conversationResponse });
    if (conversationResponse.error) {
      return Result.Err({ message: conversationResponse.error.message });
    }

    const conversation = fromRow(conversationResponse.data);

    const usersConversationsResponse = await Supabase.client
      .from<definitions["users_conversations"]>("users_conversations")
      .insert(
        userIds.map((userId) => ({
          conversation_id: conversation.conversationId,
          user_id: userId,
        })),
      );

    console.log({ usersConversationsResponse });

    if (usersConversationsResponse.error) {
      const rollbackResponse = await Supabase.client
        .from<definitions["conversation"]>("conversation")
        .delete()
        .eq("id", conversation.conversationId);

      if (rollbackResponse.error) {
        return Result.Err({
          message: `${usersConversationsResponse.error.message}. ${rollbackResponse.error}`,
        });
      }

      return Result.Err({ message: usersConversationsResponse.error.message });
    }

    const profilesConversations = usersConversationsResponse.data.map(
      ({ user_id, conversation_id }) => ({
        userId: user_id,
        conversationId: conversation_id,
      }),
    );

    return Result.Ok({ conversation, profilesConversations });
  };
