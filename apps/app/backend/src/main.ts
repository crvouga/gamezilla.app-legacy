import {
  AppServer,
  ClientToServerEvents,
  ServerToClientEvents,
  backendServerPort,
  sessionIdKey,
} from '@gamezilla/app';
import { ClientId, SessionId } from '@gamezilla/shared/app';
import { DatabaseConnectionMySQL } from '@gamezilla/shared/server';
import { Cmd, Program, toMsgType } from '@gamezilla/shared/core';
import * as Http from 'http';
import * as Socket from 'socket.io';

//
//
//
// Main
//
//
//

const main = async () => {
  console.log('[backend] planet scale connecting...');

  const DATABASE_URL =
    'mysql://scuu9usphxh6zuxltqbe:pscale_pw_lkZooGgR8H09Uc59IVrcZEt8avVQ54VObBfoFwbCIa3@aws.connect.psdb.cloud/gamezilla?ssl={"rejectUnauthorized":true}';

  const mySql = await DatabaseConnectionMySQL.create({
    connectionString: DATABASE_URL,
  });

  console.log('[backend] planet scale connected.');

  const requestListener: Http.RequestListener = (_request, response) => {
    const state = program.state$.getValue();
    response.end(JSON.stringify({ msgType: state.msg, model: state.model }));
  };

  const httpServer = Http.createServer(requestListener);

  const socketServer = new Socket.Server<
    ClientToServerEvents,
    ServerToClientEvents
  >(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
    cookie: true,
  });

  socketServer.on('connection', (socket) => {
    const maybeSessionId: unknown = socket.handshake.auth[sessionIdKey];

    const sessionId = SessionId.is(maybeSessionId)
      ? maybeSessionId
      : SessionId.generate();

    socket.emit('session-id', sessionId);

    if (ClientId.is(socket.id)) {
      AppServer.onConnect.next([sessionId, socket.id]);
    }

    socket.on('to-server', (msg) => {
      if (ClientId.is(socket.id)) {
        AppServer.fromClient.next([sessionId, socket.id, msg]);
      }
    });

    socket.on('disconnect', () => {
      if (ClientId.is(socket.id)) {
        AppServer.onDisconnect.next([sessionId, socket.id]);
      }
    });
  });

  AppServer.$broadcast.subscribe(([msg]) => {
    socketServer.emit('to-client', msg);
  });

  AppServer.$sendToClient.subscribe(([clientIds, msg]) => {
    socketServer.to(clientIds).emit('to-client', msg);
  });

  const port = Number(process.env['PORT']) || backendServerPort;

  httpServer.listen(port, () => {
    console.log(`[backend] http server listening: http://localhost:${port}/`);
  });

  const program = Program.create({
    init: AppServer.init,
    subscriptions: AppServer.subscriptions,
    update: (input) => {
      try {
        return AppServer.update({
          model: input.model,
          msg: input.msg,
          ctx: {
            mySql,
            now: input.now,
          },
        });
      } catch (error) {
        console.error('Server Crashed!', error);
        return {
          model: input.model,
          cmd: Cmd.None,
        };
      }
    },
  });

  program.state$.subscribe((state) => {
    if (state.msg) {
      const type = toMsgType(state.msg);
      // const _payload = toMsgType(state.msg);
      console.log(type);
    }
  });

  Program.run(program);
};

main();
