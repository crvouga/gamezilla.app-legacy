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
};

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
  | ['sync', BackendModel]
  | ['game', Game.ToFrontend]
  | Res;

export type ToBackend =
  | Req
  | ['room-end-then-join', { roomId: RoomId; userId: UserId }]
  | ['game', Game.ToBackend]
  | ['room-leave-then-join', { roomId: RoomId; userId: UserId }];

export type BackendMsg = ['game', RoomId, Game.BackendMsg];

export type FrontendMsg =
  | ['clicked-home']
  | ['clicked-room']
  | ['clicked-user', { userId: UserId }]
  | ['clicked-banner']
  | ['clicked-room-leave', { userId: UserId }]
  | ['game', Game.FrontendMsg]
  | ['room-end-then-join', { roomId: RoomId; userId: UserId }]
  | ['room-leave-then-join', { roomId: RoomId; userId: UserId }]
  | ['clicked-room-destroy', { userId: UserId }]
  | Req;

//
//
//
//
//

type Model = BackendModel;

export type Req =
  | [
      'room-create',
      { userId: UserId; roomId: RoomId; gameName?: Game.GameName }
    ]
  | ['room-destroy', { userId: UserId }]
  | ['room-join', { userId: UserId; roomId: RoomId }]
  | ['room-leave', { userId: UserId }]
  | ['input-game', { userId: UserId; gameName?: Game.GameName }]
  | ['change-host', { userId: UserId; nextHostId: UserId }];

export type Res =
  | [
      'room-create',
      { userId: UserId; roomId: RoomId; gameName?: Game.GameName },
      Result<Problem, Model>
    ]
  | ['room-destroy', { userId: UserId }, Result<Problem, Model>]
  | ['room-join', { userId: UserId; roomId: RoomId }, Result<Problem, Model>]
  | ['room-leave', { userId: UserId }, Result<Problem, Model>]
  | [
      'input-game',
      { userId: UserId; gameName?: Game.GameName },
      Result<Problem, Model>
    ]
  | [
      'change-host',
      { userId: UserId; nextHostId: UserId },
      Result<Problem, Model>
    ];

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

export const handle = (msg: Req, model: Model): Result<Problem, Model> => {
  switch (msg[0]) {
    case 'room-create': {
      const user = model.users[msg[1].userId];

      if (user) {
        return Err('already_in_room');
      }

      const room = model.rooms[msg[1].roomId];

      if (room) {
        return Err('impossible_state_room_id_taken');
      }

      const { gameName } = msg[1];

      const gameNew = gameName ? GameBackend.init({ gameName }) : undefined;

      const roomNew: Room = {
        roomId: msg[1].roomId,
        hostId: msg[1].userId,
      };

      const userNew: RoomUser = {
        roomId: msg[1].roomId,
        userId: msg[1].userId,
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

    case 'room-destroy': {
      const user = model.users[msg[1].userId];

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

      const usersNew = filterObject(
        model.users,
        (entry) => entry[1].roomId !== user.roomId
      );

      const modelNew: Model = {
        ...model,
        rooms: roomsNew,
        users: usersNew,
      };

      return Ok(modelNew);
    }

    case 'room-join': {
      const user = model.users[msg[1].userId];

      if (user) {
        return Err('already_in_room');
      }

      const userNew: RoomUser = {
        roomId: msg[1].roomId,
        userId: msg[1].userId,
      };

      const modelNew: Model = {
        ...model,
        users: {
          ...model.users,
          [msg[1].userId]: userNew,
        },
      };

      return Ok(modelNew);
    }

    case 'room-leave': {
      const user = model.users[msg[1].userId];

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
      const { userId, gameName } = msg[1];

      const user = model.users[userId];

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

      const gameNew = GameBackend.init({ gameName });

      const modelNew: BackendModel = {
        ...model,
        games: {
          ...model.games,
          [room.roomId]: gameNew,
        },
      };

      return Ok(modelNew);
    }

    case 'change-host': {
      const user = model.users[msg[1].userId];

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

      const nextHost = model.users[msg[1].nextHostId];

      if (!nextHost) {
        return Err('next_host_not_in_room');
      }

      const nextHostRoom = model.rooms[nextHost.roomId];

      if (!nextHostRoom) {
        return Err('next_host_room_not_found');
      }

      if (nextHostRoom.roomId !== room.roomId) {
        return Err('next_host_must_be_in_same_room');
      }

      const roomNew: Room = {
        ...room,
        hostId: nextHost.userId,
      };

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomNew.roomId]: roomNew,
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
