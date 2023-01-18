/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Cmd, Option, p, RemoteData, Result, Task } from '@gamezilla/core';
import { client, definitions, Route, UserId } from '@gamezilla/shared';
import produce from 'immer';
import * as Types from './types-';

//
//
//
// Model
//
//
//

export type Conversation = Types.Conversation;

export type Model = Types.Store;

//
//
//
// Msg
//
//
//

export type Msg = FindOneElseInsert_Done | FindManyByUserId_Done | FindOne_Done;

export type Action = FindOneElseInsert | FindManyByUserId | FindOne;

type Problem = string;

type FindOneResult = Result<
  Problem,
  {
    conversation: Conversation;
    usersConversations: Types.UsersConversations[];
    messages: Types.Message[];
  }
>;

export type FindOneElseInsert = ['FindOneElseInsert', { userIds: UserId[] }];
export type FindOneElseInsert_Done = [
  'FindOneElseInsert_Done',
  { userIds: UserId[]; result: FindOneResult }
];

export type FindManyByUserId = ['FindManyByUserId', { userId: UserId }];
export type FindManyByUserId_Done = [
  'FindManyByUserId_Done',
  {
    userId: UserId;
    result: Result<
      Problem,
      {
        conversations: Conversation[];
        usersConversations: Types.UsersConversations[];
      }
    >;
  }
];

export type FindOne = ['FindOne', { conversationId: string }];
export type FindOne_Done = [
  'FindOne_Done',
  { conversationId: string; result: FindOneResult }
];

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'FindOne_Done': {
      const { conversationId, result } = msg[1];
      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindOne[conversationId] = p(
          result,
          RemoteData.map((item) => ({
            conversation: item.conversation.conversationId,
            message: item.messages.map((item) => item.messageId),
          }))
        );

        switch (result.type) {
          case 'Err':
            break;

          case 'Ok': {
            const data = result.value;
            model.Conversation[data.conversation.conversationId] =
              data.conversation;

            for (const message of data.messages) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              model.Message[message.messageId] = message;
            }

            for (const userConversation of data.usersConversations) {
              const id = Types.toUsersConversationsId(userConversation);
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              model.UsersConversations[id] = userConversation;
            }
          }
        }
      });

      return [modelNew, Cmd.None];
    }

    case 'FindManyByUserId_Done': {
      const { userId, result } = msg[1];

      const modelNew: Model = {
        ...model,
        queries: {
          ...model.queries,
          Conversation: {
            ...model.queries.Conversation,
            FindManyByUserId: {
              ...model.queries.Conversation.FindManyByUserId,
              [userId]: p(
                result,
                RemoteData.map((data) => ({
                  conversation: data.conversations.map(
                    (item) => item.conversationId
                  ),
                  usersConversations: data.usersConversations.map(
                    Types.toUsersConversationsId
                  ),
                }))
              ),
            },
          },
        },

        Conversation: {
          ...model.Conversation,

          ...(result.type === 'Ok'
            ? result.value.conversations.reduce(
                (acc, item) => ({
                  ...acc,
                  [item.conversationId]: item,
                }),
                {}
              )
            : {}),
        },

        UsersConversations: {
          ...model.UsersConversations,

          ...(result.type === 'Ok'
            ? result.value.usersConversations.reduce(
                (acc, item) => ({
                  ...acc,
                  [Types.toUsersConversationsId(item)]: item,
                }),
                {}
              )
            : {}),
        },
      };

      return [modelNew, Cmd.None];
    }

    case 'FindOneElseInsert_Done': {
      const { result } = msg[1];

      const modelNew = produce(model, (model) => {
        model.mutations.Conversation.FindElseInsert = p(
          result,
          RemoteData.map((item) => item.conversation.conversationId)
        );

        switch (result.type) {
          case 'Err':
            break;

          case 'Ok': {
            const data = result.value;

            model.Conversation[data.conversation.conversationId] =
              data.conversation;

            for (const item of data.usersConversations) {
              const id = Types.toUsersConversationsId(item);
              // @ts-ignore
              model.UsersConversations[id] = item;
            }
            break;
          }
          default: {
            break;
          }
        }
      });

      // todo put this logic elsewhere
      const cmdNew: Cmd<Msg> =
        result.type === 'Ok'
          ? Route.push(['ChatConversation', result.value.conversation])
          : Cmd.None;

      return [modelNew, cmdNew];
    }
  }
};

export const runAction = (action: Action, model: Model): [Model, Cmd<Msg>] => {
  switch (action[0]) {
    case 'FindOne': {
      const { conversationId } = action[1];
      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindOne[conversationId] = RemoteData.Loading;
      });

      return [
        modelNew,
        p(
          findOneById({ conversationId }),
          Cmd.perform(
            (result): Msg => ['FindOne_Done', { conversationId, result }]
          )
        ),
      ];
    }

    case 'FindManyByUserId': {
      const { userId } = action[1];

      const query =
        model.queries.Conversation.FindManyByUserId[userId] ??
        RemoteData.NotAsked;

      if (query.type === 'Ok') {
        return [model, Cmd.None];
      }

      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindManyByUserId[userId] =
          RemoteData.Loading;
      });

      return [
        modelNew,
        p(
          findManyByUserId({ userId }),
          Cmd.perform(
            (result): Msg => ['FindManyByUserId_Done', { userId, result }]
          )
        ),
      ];
    }

    case 'FindOneElseInsert': {
      const { userIds } = action[1];

      const modelNew = produce(model, (model) => {
        model.mutations.Conversation.FindElseInsert = RemoteData.Loading;
      });

      return [
        modelNew,
        p(
          findOneElseInsert({ userIds }),
          Cmd.perform(
            (result): Msg => ['FindOneElseInsert_Done', { userIds, result }]
          )
        ),
      ];
    }
  }
};

//
//
//
// Data Access
//
//
//

const fromRow = (row: definitions['conversation']): Conversation => {
  return {
    conversationId: row.id,
  };
};

const findOneById =
  ({ conversationId }: { conversationId: string }): Task<FindOneResult> =>
  async () => {
    const matchConversationIdResponse = await client
      .from<definitions['users_conversations']>('users_conversations')
      .select('*')
      .eq('conversation_id', conversationId);

    if (matchConversationIdResponse.error) {
      return Result.Err(matchConversationIdResponse.error.message);
    }

    const userIds = Array.from(
      new Set(matchConversationIdResponse.data.map((item) => item.user_id))
    );

    const profilesResponse = await client
      .from<definitions['user_profile']>('user_profile')
      .select('*')
      .in('id', userIds);

    if (profilesResponse.error) {
      return Result.Err(profilesResponse.error.message);
    }

    const messagesResponse = await client
      .from<definitions['message']>('message')
      .select('*')
      .eq('conversation_id', conversationId);

    if (messagesResponse.error) {
      return Result.Err(messagesResponse.error.message);
    }

    return Result.Ok({
      conversation: {
        conversationId,
      },
      usersConversations: profilesResponse.data
        .map((item) => ({
          conversationId,
          userId: UserId.decode(item.id),
        }))
        .flatMap((item) =>
          item.userId.type === 'Ok'
            ? [{ ...item, userId: item.userId.value }]
            : []
        ),
      messages: messagesResponse.data
        .map((item) => ({
          messageId: item.id,
          message: item.message,
          userId: UserId.decode(item.user_id),
          conversationId: item.conversation_id,
        }))
        .flatMap((item) =>
          item.userId.type === 'Ok'
            ? [{ ...item, userId: item.userId.value }]
            : []
        ),
    });
  };

const findManyByUserId =
  ({
    userId,
  }: {
    userId: UserId;
  }): Task<
    Result<
      Problem,
      {
        conversations: Conversation[];
        usersConversations: Types.UsersConversations[];
      }
    >
  > =>
  async () => {
    const matchUserIdResponse = await client
      .from<definitions['users_conversations']>('users_conversations')
      .select('*')
      .match({ user_id: userId });

    if (matchUserIdResponse.error) {
      return Result.Err(matchUserIdResponse.error.message);
    }

    const conversationResponse = await client
      .from<definitions['conversation']>('conversation')
      .select('*')
      .in(
        'id',
        matchUserIdResponse.data.map((item) => item.conversation_id)
      );

    if (conversationResponse.error) {
      return Result.Err(conversationResponse.error.message);
    }

    const matchConversationIdResponse = await client
      .from<definitions['users_conversations']>('users_conversations')
      .select('*')
      .in(
        'conversation_id',
        conversationResponse.data.map((item) => item.id)
      );

    if (matchConversationIdResponse.error) {
      return Result.Err(matchConversationIdResponse.error.message);
    }

    const profileResponse = await client
      .from<definitions['user_profile']>('user_profile')
      .select('*')
      .in('id', [
        ...new Set(
          matchConversationIdResponse.data.map((item) => item.user_id)
        ),
      ]);

    if (profileResponse.error) {
      return Result.Err(profileResponse.error.message);
    }

    return Result.Ok({
      usersConversations: [
        ...matchUserIdResponse.data,
        ...matchConversationIdResponse.data,
      ]
        .map((item) => ({
          userId: UserId.decode(item.user_id),
          conversationId: item.conversation_id,
        }))
        .flatMap((item) =>
          item.userId.type === 'Ok'
            ? [{ ...item, userId: item.userId.value }]
            : []
        ),
      conversations: conversationResponse.data.map((item) => ({
        conversationId: item.id,
      })),
    });
  };

const findUniqueByUserIds =
  ({ userIds }: { userIds: string[] }): Task<Result<Problem, Option<string>>> =>
  async () => {
    const usersConversationsResponse = await client
      .from<definitions['users_conversations']>('users_conversations')
      .select('*')
      .in('user_id', userIds);

    if (usersConversationsResponse.error) {
      return Result.Err(usersConversationsResponse.error.message);
    }

    // todo. this should be in the database query
    const userIdsByConversationId = usersConversationsResponse.data.reduce<{
      [conversationId: string]: { [userId: UserId]: string };
    }>(
      (byId, item) => ({
        ...byId,
        [item.conversation_id]: {
          ...(byId[item.conversation_id] ?? {}),
          [item.user_id]: item.user_id,
        },
      }),
      {}
    );

    const conversationId = Object.entries(userIdsByConversationId)
      .filter(
        (entry) =>
          userIds.every((userId) => userId in entry[1]) &&
          userIds.length === Object.values(entry[1]).length
      )
      .map((entry) => entry[0])[0];

    return Result.Ok(Option.fromNullable(conversationId));
  };

const findOneElseInsert =
  ({ userIds }: { userIds: string[] }): Task<FindOneResult> =>
  async () => {
    const findIdResult = await findUniqueByUserIds({ userIds })();

    if (findIdResult.type === 'Err') {
      return findIdResult;
    }
    if (findIdResult.value.type === 'none') {
      const insertResult = await insert({ userIds })();

      if (insertResult.type === 'Err') {
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
  }): Task<
    Result<
      Problem,
      {
        conversation: Conversation;
        usersConversations: Types.UsersConversations[];
      }
    >
  > =>
  async () => {
    const conversationResponse = await client
      .from<definitions['conversation']>('conversation')
      .insert({})
      .single();

    if (conversationResponse.error) {
      return Result.Err(conversationResponse.error.message);
    }

    const conversation = fromRow(conversationResponse.data);

    const usersConversationsResponse = await client
      .from<definitions['users_conversations']>('users_conversations')
      .insert(
        userIds.map((userId) => ({
          conversation_id: conversation.conversationId,
          user_id: userId,
        }))
      );

    if (usersConversationsResponse.error) {
      const rollbackResponse = await client
        .from<definitions['conversation']>('conversation')
        .delete()
        .eq('id', conversation.conversationId);

      if (rollbackResponse.error) {
        return Result.Err(
          `${usersConversationsResponse.error.message}. ${rollbackResponse.error}`
        );
      }

      return Result.Err(usersConversationsResponse.error.message);
    }

    const usersConversations = usersConversationsResponse.data
      .map(({ user_id, conversation_id }) => ({
        userId: UserId.decode(user_id),
        conversationId: conversation_id,
      }))
      .flatMap((item) =>
        item.userId.type === 'Ok'
          ? [{ ...item, userId: item.userId.value }]
          : []
      );

    return Result.Ok({ conversation, usersConversations });
  };
