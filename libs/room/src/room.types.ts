import { RemoteData, Result } from '@gamezilla/core';
import { RoomId, UserId } from '@gamezilla/shared';
import * as GameBackend from './game.backend';
import * as Game from './game.types';

const { Ok, Err } = Result;

//
//
//
// Model
//
//
//

export type SharedModel = {
  rooms: {
    [roomId: RoomId]: Room;
  };
  users: {
    [userId: UserId]: {
      userId: UserId;
      roomId: RoomId;
    };
  };
};

export type BackendModel = SharedModel & {
  games: {
    [roomId: RoomId]: Game.BackendModel;
  };
};

export type FrontendModel = SharedModel & {
  games: {
    [roomId: RoomId]: Game.FrontendModel;
  };
  requests: {
    [key in Req[0]]?: RemoteData<Problem, 'none'>;
  };
  previewUserId: UserId | null;
  modal: ModalModel;
};

type ModalModel = 'none' | 'user-preview' | 'users';

export type FrontendRoom = {
  roomId: RoomId;
  hostId: UserId;
  game?: Game.FrontendModel;
};

export type RoomUser = {
  userId: UserId;
  roomId: RoomId;
};

export type Room = {
  roomId: RoomId;
  hostId: UserId;
};

//
//
//
// Msg
//
//
//

export type ToFrontend =
  | ['game', Game.ToFrontend]
  | ['initialize', BackendModel]
  | Res;

export type ToBackend = Req | ['game', Game.ToBackend];

export type BackendMsg = ['game', RoomId, Game.BackendMsg];

export type FrontendMsg =
  | Req
  | ['game', Game.FrontendMsg]
  | ['modal-closed']
  | ['modal-open', ModalModel]
  | ['clicked-room', { roomId: RoomId }]
  | ['clicked-user', { userId: UserId }]
  | ['clicked-user-link', { userId: UserId }];

//
//
//
//
//

type Model = BackendModel;

export type Req =
  | ['create', { roomId: RoomId; gameName?: Game.GameName }]
  | ['destroy', { userId: UserId }]
  | ['join', { userId: UserId; roomId: RoomId }]
  | ['leave', { userId: UserId }]
  | ['input-game', { gameName?: Game.GameName }];

export type Res = [...Req, Result<Problem, Model>];

export type Problem =
  | 'must_be_host'
  | 'must_be_guest'
  | 'not_in_room'
  | 'already_in_room'
  | 'room_not_found'
  | 'impossible_state_room_id_taken'
  | ChangeHostProblem;

type ChangeHostProblem =
  | 'next_host_not_in_room'
  | 'next_host_room_not_found'
  | 'next_host_must_be_in_same_room';

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: { currentUserId: UserId };
  msg: Req;
  model: Model;
}): Result<Problem, Model> => {
  switch (msg[0]) {
    case 'create': {
      const user = model.users[ctx.currentUserId];

      if (user) {
        return Err('already_in_room');
      }

      const room = model.rooms[msg[1].roomId];

      if (room) {
        return Err('impossible_state_room_id_taken');
      }

      const { gameName } = msg[1];

      const gameNew = gameName
        ? GameBackend.init({
            gameName,
            ctx: {
              currentUserId: ctx.currentUserId,
            },
          })
        : undefined;

      const roomNew: Room = {
        roomId: msg[1].roomId,
        hostId: ctx.currentUserId,
      };

      const userNew: RoomUser = {
        roomId: msg[1].roomId,
        userId: ctx.currentUserId,
      };

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [roomNew.roomId]: gameNew,
        },
        rooms: {
          ...model.rooms,
          [roomNew.roomId]: roomNew,
        },
        users: {
          ...model.users,
          [userNew.userId]: userNew,
        },
      };

      return Ok(modelNew);
    }

    case 'destroy': {
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return Err('not_in_room');
      }

      const room = model.rooms[user.roomId];

      if (!room) {
        return Err('room_not_found');
      }

      if (room.hostId !== user.userId) {
        return Err('must_be_host');
      }

      const roomsNew = removeKey(room.roomId, model.rooms);

      const gamesNew = removeKey(room.roomId, model.games);

      const usersNew = filterObject(
        model.users,
        (entry) => entry[1].roomId !== user.roomId
      );

      const modelNew: Model = {
        ...model,
        games: gamesNew,
        rooms: roomsNew,
        users: usersNew,
      };

      return Ok(modelNew);
    }

    case 'join': {
      const user = model.users[ctx.currentUserId];

      if (user) {
        return Err('already_in_room');
      }

      const userNew: RoomUser = {
        roomId: msg[1].roomId,
        userId: ctx.currentUserId,
      };

      const modelNew: Model = {
        ...model,
        users: {
          ...model.users,
          [ctx.currentUserId]: userNew,
        },
      };

      return Ok(modelNew);
    }

    case 'leave': {
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return Err('not_in_room');
      }

      const room = model.rooms[user.roomId];

      if (!room) {
        return Err('room_not_found');
      }

      if (user.userId === room.hostId) {
        return Err('must_be_guest');
      }

      const usersNew = removeKey(user.userId, model.users);

      const modelNew: Model = {
        ...model,
        users: usersNew,
      };

      return Ok(modelNew);
    }

    case 'input-game': {
      const { gameName } = msg[1];

      const user = model.users[ctx.currentUserId];

      if (!user) {
        return Err('not_in_room');
      }

      const room = model.rooms[user.roomId];

      if (!room) {
        return Err('not_in_room');
      }

      if (room.hostId !== user.userId) {
        return Err('must_be_host');
      }

      if (!gameName) {
        const modelNew: BackendModel = {
          ...model,
          games: removeKey(room.roomId, model.games),
        };

        return Ok(modelNew);
      }

      const gameNew = GameBackend.init({
        gameName,
        ctx,
      });

      const modelNew: BackendModel = {
        ...model,
        games: {
          ...model.games,
          [room.roomId]: gameNew,
        },
      };

      return Ok(modelNew);
    }
  }
};

//
//
//
// Helpers
//
//
//

const removeKey = <T>(key: keyof T, obj: T): Omit<T, keyof T> => {
  const { [key]: _value, ...rest } = obj;
  return rest;
};

type Entry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

const filterObject = <T extends object>(
  obj: T,
  predicate: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean
): T => {
  return Object.fromEntries(
    (Object.entries(obj) as Entry<T>[]).filter(predicate)
  ) as T;
};
