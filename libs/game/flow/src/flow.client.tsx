import { UserId } from '@gamezilla/shared/app';
import { RoomViewCtx, ViewMainMenu } from '@gamezilla/shared/client';
import { Cmd, Sub } from '@gamezilla/shared/core';
import { IconScrewdriverWrench } from '@gamezilla/shared/ui';
import { viewCoverArt } from './flow-cover-art';
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from './flow.shared';
import { PuzzleBuilderClient } from './puzzle-builder';

type Model = ClientModel;

export const init = (_args: { playerId?: UserId }): Model => {
  return {
    t: 'none',
  };
};

type Msg = ClientMsg;

export const update = ({
  model,
  msg,
  sendToServer,
}: {
  msg: Msg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (model.t === 'puzzle-builder' && msg.t === 'puzzle-builder') {
    const updated = PuzzleBuilderClient.update({
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: 'puzzle-builder', c: updated.model },
      cmd: Cmd.tag_('puzzle-builder', updated.cmd),
    };
  }

  if (msg.t === 'input-mode') {
    return { model, cmd: sendToServer(msg) };
  }

  return { model };
};

export const updateFromServer = ({
  model,
  msg,
}: {
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-mode') {
    if (msg.result.type === 'Err') {
      return { model };
    }
    const merged = mergeWithServer({ client: model, server: msg.result.value });
    return { model: merged };
  }

  if (msg.t === 'puzzle-builder' && model.t === 'puzzle-builder') {
    const updated = PuzzleBuilderClient.updateFromServer({
      model: model.c,
      msg: msg.c,
    });
    return {
      model: { t: 'puzzle-builder', c: updated.model },
      cmd: Cmd.tag_('puzzle-builder', updated.cmd),
    };
  }

  return { model };
};

export const mergeWithServer = ({
  client,
  server,
}: {
  client: ClientModel;
  server: ServerModel;
}): ClientModel => {
  if (server.t === 'none') {
    return server;
  }

  if (server.t === 'puzzle-builder') {
    const client_ = client.t === 'puzzle-builder' ? client.c : undefined;
    return {
      t: 'puzzle-builder',
      c: PuzzleBuilderClient.mergeWithServer({
        client: client_,
        server: server.c,
      }),
    };
  }

  return client;
};

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
// View
//
//

export const View = ({
  ctx,
  $send,
  model,
}: {
  model: Model;
  $send: (m: Msg) => void;
  ctx: RoomViewCtx;
}) => {
  if (model.t === 'puzzle-builder') {
    return (
      <PuzzleBuilderClient.View
        $send={(c) => $send({ t: 'puzzle-builder', c })}
        ctx={ctx}
        onExit={() => $send({ t: 'input-mode', mode: 'none' })}
        model={model.c}
      />
    );
  }
  return (
    <ViewMainMenu
      coverArt={viewCoverArt()}
      roomCtx={ctx}
      title="Flow"
      buttons={[
        {
          icon: <IconScrewdriverWrench />,
          label: 'Level builder',
          onClick: () => {
            $send({ t: 'input-mode', mode: 'puzzle-builder' });
          },
        },
      ]}
    />
  );
};
