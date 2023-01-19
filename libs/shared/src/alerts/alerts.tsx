import { Cmd, Time, Uuid } from '@gamezilla/core';
import { ConformationDialog, Portal, Snackbar } from '@gamezilla/shared/ui';

//
//
//
// Model
//
//
//

export type Model<TMsg = never> = {
  queue: Snack[];
  conformation:
    | { tag: 'closed'; title: string }
    | { tag: 'opened'; title: string; onConfirm: TMsg };
};

type SnackId = string;

export type Snack = {
  variant: Variant;
  snackId: SnackId;
  message: string;
  title?: string;
};

export const init: Model = {
  queue: [],
  conformation: { tag: 'closed', title: '' },
};

type Variant = 'Info' | 'Error';

//
//
//
// Update
//
//
//

export type Msg =
  | ['elapsed', SnackId]
  | ['clicked_close', SnackId]
  | ['clicked_away_close', SnackId]
  | ['conformation_closed']
  | ['conformation_cancelled']
  | ['conformation_confirmed'];

export type Action<TMsg = never> = [
  'Alerts',
  (
    | { tag: 'Snack'; variant?: Variant; title?: string; message: string }
    | { tag: 'Conformation'; title: string; onConfirm: TMsg }
  )
];

export const mapAction = <A, B>(
  f: (a: A) => B,
  action: Action<A>
): Action<B> => {
  if (action[1].tag === 'Conformation') {
    return ['Alerts', { ...action[1], onConfirm: f(action[1].onConfirm) }];
  }
  return ['Alerts', { ...action[1] }];
};

export const update = <TMsg,>(
  msg: Msg,
  model: Model<TMsg>
): [Model<TMsg>, Cmd<Msg>, TMsg[]] => {
  switch (msg[0]) {
    case 'elapsed': {
      const snackId = msg[1];
      return [
        {
          ...model,
          queue: model.queue.filter((snack) => snack.snackId !== snackId),
        },
        Time.cancelTimeout(snackId),
        [],
      ];
    }

    case 'clicked_close': {
      const snackId = msg[1];
      return [
        {
          ...model,
          queue: model.queue.filter((snack) => snack.snackId !== snackId),
        },
        Time.cancelTimeout(snackId),
        [],
      ];
    }

    case 'clicked_away_close': {
      return [model, Cmd.None, []];
    }

    case 'conformation_cancelled': {
      return [
        {
          ...model,
          conformation: { tag: 'closed', title: model.conformation.title },
        },
        Cmd.None,
        [],
      ];
    }

    case 'conformation_closed': {
      return [
        {
          ...model,
          conformation: { tag: 'closed', title: model.conformation.title },
        },
        Cmd.None,
        [],
      ];
    }

    case 'conformation_confirmed': {
      const modelNew: Model = {
        ...model,
        conformation: { tag: 'closed', title: model.conformation.title },
      };
      const outMsgs =
        model.conformation.tag === 'opened'
          ? [model.conformation.onConfirm]
          : [];
      return [modelNew, Cmd.None, outMsgs];
    }
  }
};

const snackTimeout = 4000;

export const runAction = <TMsg,>(
  action: Action<TMsg>,
  model: Model<TMsg>
): [Model<TMsg>, Cmd<Msg>] => {
  switch (action[1].tag) {
    case 'Conformation': {
      const modelNew: Model<TMsg> = {
        ...model,
        conformation: {
          tag: 'opened',
          onConfirm: action[1].onConfirm,
          title: action[1].title,
        },
      };
      return [modelNew, Cmd.None];
    }
    case 'Snack': {
      const { message, title, variant } = action[1];

      const snack: Snack = {
        snackId: Uuid.generateSync(),
        message,
        variant: variant ?? 'Info',
        title,
      };

      return [
        {
          ...model,
          queue: [snack, ...model.queue],
        },
        Time.startTimeout(snack.snackId, snackTimeout, [
          'elapsed',
          snack.snackId,
        ]),
      ];
    }
  }
};

//
//
//
// View
//
//
//

export const View = <TMsg,>({
  $send,
  model,
}: {
  model: Model<TMsg>;
  $send: (msg: Msg) => void;
}) => {
  return (
    <>
      <ConformationDialog
        confirmTitle="Confirm"
        onCancel={() => $send(['conformation_cancelled'])}
        onClose={() => $send(['conformation_closed'])}
        onConfirm={() => $send(['conformation_confirmed'])}
        open={model.conformation.tag === 'opened'}
        title={model.conformation.title}
        cancelTitle="Cancel"
      />

      <Portal>
        {model.queue[0] && (
          <Snackbar
            anchorOrigin={{
              horizontal: 'center',
              vertical: 'top',
            }}
            open
            message={model.queue[0].message}
            onClose={() => {
              if (model.queue[0]) {
                $send(['clicked_away_close', model.queue[0].snackId]);
              }
            }}
          />
        )}
      </Portal>
    </>
  );
};
