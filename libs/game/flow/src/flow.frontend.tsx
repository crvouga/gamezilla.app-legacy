import { Cmd, Sub } from '@gamezilla/core';
import { RoomViewCtx, UserId, ViewBottomButtonBar } from '@gamezilla/shared';
import { IconArrowLeftOnRect } from '@gamezilla/shared/ui';
import { Flow } from './flow';
import {
  FrontendModel,
  FrontendMsg,
  SharedModel,
  ToFrontend,
  initShared,
} from './flow.types';

type Model = FrontendModel;

export const init = ({ playerId }: { playerId?: UserId }): Model => {
  return {
    ...initShared,
    playerId,
  };
};

type Msg = FrontendMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (
    msg.t === 'mouse-move' &&
    model.mouseStatus === 'down' &&
    typeof model.activeColor === 'string'
  ) {
    return {
      model: {
        ...model,
        pathByColor: {
          ...model.pathByColor,
          [model.activeColor]: Flow.addNodeToPath(
            model.pathByColor[model.activeColor] ?? [],
            msg.nodeId
          ),
        },
      },
    };
  }

  if (msg.t === 'mouse-down') {
    const node = model.puzzle.nodes[msg.nodeId];
    if (node && Flow.isColored(node)) {
      return {
        model: {
          ...model,
          mouseStatus: 'down',
          activeColor: node.color,
          pathByColor: {
            ...model.pathByColor,
            [node.color]: Flow.addNodeToPath(
              model.pathByColor[node.color] ?? [],
              msg.nodeId
            ),
          },
        },
      };
    }
    return {
      model: {
        ...model,
        mouseStatus: 'down',
        activeColor: null,
      },
    };
  }

  if (msg.t === 'mouse-up') {
    return { model: { ...model, mouseStatus: 'up', activeColor: null } };
  }

  if (msg.t === 'mouse-leave') {
    return { model: { ...model, mouseStatus: 'up', activeColor: null } };
  }

  return { model };
};

export const updateFromBackend = ({
  model,
}: {
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return { model };
};

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
}: {
  frontendModel: FrontendModel;
  backendModel: SharedModel;
}) => {
  return {
    ...frontendModel,
    ...backendModel,
  };
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
  model,
  ctx,
  $send,
}: {
  model: Model;
  $send: (m: Msg) => void;
  ctx: RoomViewCtx;
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        <Flow.View
          puzzle={model.puzzle}
          pathByColor={model.pathByColor}
          $send={$send}
        />
      </div>
      <ViewBottomButtonBar
        actions={[['Quit', <IconArrowLeftOnRect />, ctx.onQuit]]}
      />
    </div>
  );
};
