import {
  AppFrontend,
  ClientToServerEvents,
  ServerToClientEvents,
  ToServer,
  backendServerPort,
  sessionIdKey,
} from '@gamezilla/app';
import { Browser, Cmd, Debug, Program } from '@gamezilla/shared/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Socket, io } from 'socket.io-client';

//
//
//
// Main
//
//
//

const main = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  const backendUrl = isProduction
    ? 'https://backend.gamezilla.app/'
    : `http://localhost:${backendServerPort}/`;

  const socketClient: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    backendUrl,
    {
      auth: {
        [sessionIdKey]: localStorage.getItem(sessionIdKey) ?? undefined,
      },
    }
  );

  socketClient.on('session-id', (sessionId) => {
    console.log(`session-id: ${sessionId}`);
    localStorage.setItem(sessionIdKey, sessionId);
  });

  socketClient.on('connect', () => {
    AppFrontend.wireStatus$.next('connected');
  });

  socketClient.on('disconnect', () => {
    AppFrontend.wireStatus$.next('disconnected');
  });

  socketClient.on('connect_error', () => {
    AppFrontend.wireStatus$.next('connect-error');
  });

  socketClient.on('to-client', (msg) => {
    AppFrontend.toFrontend$.next(msg);
  });

  const sendToServer =
    (msg: ToServer): Cmd =>
    () => {
      socketClient.emit('to-server', msg);
    };

  const program = Program.create({
    init: AppFrontend.init({ location: Browser.getLocation() }),
    update: (input) => AppFrontend.update({ ...input, sendToServer }),
    subscriptions: AppFrontend.subscriptions,
  });

  const attached = Debug.ReduxDevTools.withDebugger(program);

  Program.run(attached.program);

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  program.state$.subscribe((state) => {
    root.render(
      <React.StrictMode>
        <AppFrontend.View
          isTimeTravelDebugging={state.model._debugId < state.runningDebugId}
          now={state.model._now}
          model={state.model}
          $send={program.$send}
        />
      </React.StrictMode>
    );
  });
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (import.meta.hot) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!import.meta.hot.data?.['started']) {
    console.log('[hot] starting app');
    main();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import.meta.hot.data['started'] = true;
  } else {
    console.log('[hot] reload');
  }
} else {
  main();
}
