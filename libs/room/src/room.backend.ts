import { Cmd, exhaustive, p, Sub } from '@gamezilla/core';
import { ClientId, RoomId, UserId } from '@gamezilla/shared';
import { AppMsg, DatabaseConnection } from '@gamezilla/shared/backend';
import * as Game from './game.backend';
import {
  BackendModel,
  BackendMsg,
  handle,
  Res,
  ToBackend,
  ToFrontend,
} from './room.types';

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = {
  rooms: {},
  users: {},
  games: {},
};

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

export const update = ({
  model,
  msg,
  sendToUser,
}: {
  sendToUser: (userIds: UserId[], msg: ToFrontend) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case 'game': {
      const { roomId } = msg;

      const game = model.games[roomId];

      if (!game) {
        return { model };
      }

      const gameMsg = msg.c;

      const updated = Game.update(
        {
          broadcast: (m) =>
            sendToRoom({ sendToUser, model, roomId, msg: { t: 'game', c: m } }),
        },
        gameMsg,
        game
      );

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [roomId]: updated[0],
        },
      };

      return {
        model: modelNew,
        cmd: p(
          updated[1],
          Cmd.map((m): Msg => ({ t: 'game', roomId, c: m }))
        ),
      };
    }
  }
};

type Wire = {
  sendToClient: (msg: ToFrontend) => Cmd;
  sendToUser: (userId: UserId[], msg: ToFrontend) => Cmd;
  broadcast: (msg: ToFrontend) => Cmd;
};

export const updateFromFrontend = ({
  ctx,
  wire,
  msg,
  model,
}: {
  ctx: {
    currentUserId: UserId;
    dbConn: DatabaseConnection;
  };
  wire: Wire;
  msg: ToBackend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<BackendMsg>;
} => {
  switch (msg.t) {
    case 'list':
    case 'input-game':
    case 'join':
    case 'destroy':
    case 'create': {
      const res: Res = { ...msg, result: handle({ ctx, model, msg }) };

      if (res.result.type === 'Err') {
        return { model, cmd: wire.sendToClient(res) };
      }

      return { model: res.result.value, cmd: wire.broadcast(res) };
    }

    case 'leave': {
      return updateLeave({ ctx, wire, model, msg });
    }

    case 'game': {
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return { model };
      }

      const room = model.rooms[user.roomId];

      if (!room) {
        return { model };
      }

      const game = model.games[user.roomId];

      if (!game) {
        return { model };
      }

      const gameMsg = msg.c;

      const [gameNew, gameCmd] = Game.updateFromFrontend({
        ...ctx,
        ctx: {
          currentUserId: ctx.currentUserId,
          hostId: room.hostId,
        },
        hostId: room.hostId,
        sendToClient: (m) => wire.sendToClient({ t: 'game', c: m }),
        broadcast: (m) =>
          sendToRoom({
            sendToUser: wire.sendToUser,
            model,
            roomId: room.roomId,
            msg: { t: 'game', c: m },
          }),
        msg: gameMsg,
        model: game,
      });

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [room.roomId]: gameNew,
        },
      };

      return {
        model: modelNew,
        cmd: p(
          gameCmd,
          Cmd.map((msg): Msg => ({ t: 'game', roomId: room.roomId, c: msg }))
        ),
      };
    }

    default:
      return exhaustive(msg[0]);
  }
};

const updateLeave = ({
  wire,
  model,
  msg,
  ctx,
}: {
  msg: ToBackend;
  wire: Wire;
  model: Model;
  ctx: { currentUserId: UserId };
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t !== 'leave') {
    return { model };
  }

  const result = handle({ ctx, model, msg });
  const res: Res = { ...msg, result };

  if (result.type === 'Err') {
    return { model, cmd: wire.sendToClient(res) };
  }

  const modelAfter = result.value;

  const user = model.users[ctx.currentUserId];

  if (!user) {
    return { model: modelAfter, cmd: wire.broadcast(res) };
  }

  const room = model.rooms[user.roomId];

  if (!room) {
    return { model: modelAfter, cmd: wire.broadcast(res) };
  }

  const game = model.games[room.roomId];

  if (!game) {
    return { model: modelAfter, cmd: wire.broadcast(res) };
  }

  const updated = Game.updateFromRoom({
    broadcast: (msg) => {
      return sendToRoom({
        sendToUser: wire.sendToUser,
        model: modelAfter,
        roomId: room.roomId,
        msg: { t: 'game', c: msg },
      });
    },
    model: game,
    msg: ['user-left', { userId: ctx.currentUserId }],
  });

  const modelNew: Model = {
    ...modelAfter,
    games: {
      ...modelAfter.games,
      [user.roomId]: updated.model,
    },
  };

  return {
    model: modelNew,
    cmd: Cmd.batch([
      wire.broadcast(res),
      p(
        updated.cmd ?? Cmd.None,
        Cmd.map((msg): Msg => ({ t: 'game', roomId: room.roomId, c: msg }))
      ),
    ]),
  };
};

export const updateFromApp = ({
  msg,
  model,
}: {
  msg: AppMsg;
  model: Model;
  sendToFrontend: (clientId: ClientId[], msg: ToFrontend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    case 'client-connected': {
      return {
        model,
      };
    }
  }
};

const sendToRoom = ({
  model,
  sendToUser,
  roomId,
  msg,
}: {
  model: Model;
  sendToUser: (userIds: UserId[], msg: ToFrontend) => Cmd;
  roomId: RoomId;
  msg: ToFrontend;
}): Cmd => {
  const userIds: UserId[] = [];

  for (const userId in model.users) {
    if (!UserId.is(userId)) {
      continue;
    }

    const user = model.users[userId];

    if (!user) {
      continue;
    }

    if (user.roomId === roomId) {
      userIds.push(userId);
    }
  }

  return sendToUser(userIds, msg);
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
  const subs: Sub<Msg>[] = [];

  for (const roomId in model.rooms) {
    if (!RoomId.is(roomId)) {
      continue;
    }

    const game = model.games[roomId];

    if (!game) {
      continue;
    }

    const sub = p(
      Game.subscriptions(`room/${roomId}`, game),
      Sub.map((msg): Msg => ({ t: 'game', roomId, c: msg }))
    );

    subs.push(sub);
  }

  return Sub.batch(subs);
};
