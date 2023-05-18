import { RemoteResult, Result } from '@gamezilla/shared/core';
import { RoomId, UserId, Username } from '@gamezilla/shared/app';
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
  profiles: {
    [userId: UserId]: {
      userId: UserId;
      username: Username;
      avatarUrl: string;
    };
  };
};

export type ServerModel = SharedModel & {
  games: {
    [roomId: RoomId]: Game.ServerModel;
  };
};

export type FrontendModel = SharedModel & {
  games: {
    [roomId: RoomId]: Game.FrontendModel;
  };
  requests: {
    [key in Req['t']]?: RemoteResult<Problem, 'none'>;
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

export type ToFrontend = (Res | { t: 'game'; c: Game.ToFrontend }) & Extra;

export type ToBackend = (Req | { t: 'game'; c: Game.ToBackend }) & Extra;

export type ServerMsg = { t: 'game'; roomId: RoomId; c: Game.ServerMsg };

export type FrontendMsg =
  | Req
  | { t: 'game'; c: Game.FrontendMsg }
  | { t: 'modal-closed' }
  | { t: 'modal-open'; c: ModalModel }
  | { t: 'clicked-room'; roomId: RoomId }
  | { t: 'clicked-user'; userId: UserId }
  | { t: 'clicked-user-link'; userId: UserId };

type Extra = {
  profile?: {
    userId: UserId;
    username: Username;
    avatarUrl: string;
  };
  initiatorMsg?: unknown;
};

//
//
//
//
//

type Model = ServerModel;

export type Req =
  | { t: 'list' }
  | { t: 'create'; roomId: RoomId; gameName?: Game.GameName }
  | { t: 'destroy'; userId: UserId }
  | { t: 'join'; userId: UserId; roomId: RoomId }
  | { t: 'leave'; userId: UserId }
  | { t: 'input-game'; gameName?: Game.GameName };

export type Res = Req & { result: Result<Problem, Model> };

export type Problem =
  | 'must_be_host'
  | 'must_be_guest'
  | 'not_in_room'
  | 'already_in_room'
  | 'room_not_found'
  | 'impossible_state_room_id_taken';

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: { currentUserId: UserId };
  msg: Req;
  model: Model;
}): Result<Problem, Model> => {
  switch (msg.t) {
    case 'list': {
      return Ok(model);
    }

    case 'create': {
      const user = model.users[ctx.currentUserId];

      if (user) {
        return Err('already_in_room');
      }

      const room = model.rooms[msg.roomId];

      if (room) {
        return Err('impossible_state_room_id_taken');
      }

      const { gameName } = msg;

      const gameNew = gameName
        ? GameBackend.init({
            gameName,
            ctx: {
              currentUserId: ctx.currentUserId,
            },
          })
        : undefined;

      const roomNew: Room = {
        roomId: msg.roomId,
        hostId: ctx.currentUserId,
      };

      const userNew: RoomUser = {
        roomId: msg.roomId,
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
        roomId: msg.roomId,
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
      const { gameName } = msg;

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
        const modelNew: ServerModel = {
          ...model,
          games: removeKey(room.roomId, model.games),
        };

        return Ok(modelNew);
      }

      const gameNew = GameBackend.init({
        gameName,
        ctx,
      });

      const modelNew: ServerModel = {
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
