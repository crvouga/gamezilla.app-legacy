import { Cmd } from '@gamezilla/core';
import { Ctx, Route } from '@gamezilla/temp-shared';
import {
  Avatar,
  Button,
  Field,
  FillBox,
  Header,
  HeaderBackButton,
  List,
} from '@gamezilla/temp-shared/ui';

//
//
//
// Model
//
//
//

export type Model = null;

export const init: Model = null;

//
//
//
// Update
//
//
//

export type Msg =
  | ['clicked-back']
  | ['clicked-name']
  | ['clicked-username']
  | ['clicked-avatar']
  | ['clicked-change-avatar']
  | ['clicked-theme'];

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'clicked-avatar':
      return { model, cmd: Route.push(['profile-update-avatar']) };

    case 'clicked-change-avatar':
      return { model, cmd: Route.push(['profile-update-avatar']) };

    case 'clicked-back':
      return { model, cmd: Route.back };

    case 'clicked-name':
      return { model, cmd: Route.push(['profile-update-name']) };

    case 'clicked-username':
      return { model, cmd: Route.push(['profile-update-username']) };

    case 'clicked-theme':
      return { model, cmd: Route.push(['profile-update-theme']) };
  }
};

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  $send,
}: {
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const profile = ctx.profiles[ctx.currentUserId];
  return (
    <FillBox>
      <Header
        left={<HeaderBackButton onClick={() => $send(['clicked-back'])} />}
        title="Update Profile"
      />

      <Avatar
        src={profile?.avatarUrl ?? '...'}
        sx={{
          marginX: 'auto',
          width: '150px',
          height: '150px',
          marginBottom: 1,
        }}
        onClick={() => $send(['clicked-avatar'])}
      />

      <Button
        sx={{ display: 'block', marginX: 'auto', marginBottom: 2 }}
        onClick={() => $send(['clicked-change-avatar'])}
      >
        Change Avatar
      </Button>

      <List>
        <Field
          label="Username"
          value={profile?.username ?? '...'}
          onClick={() => $send(['clicked-username'])}
        />

        <Field
          label="Theme"
          value={profile?.themeMode ?? '...'}
          onClick={() => $send(['clicked-theme'])}
        />
      </List>
    </FillBox>
  );
};
