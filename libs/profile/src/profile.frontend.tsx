import { Cmd, RemoteData, Sub } from '@gamezilla/core';
import {
  AppMsg,
  ViewCtx,
  ProfileAvatar,
  Route,
  UserId,
} from '@gamezilla/shared';
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  ConformationDialog,
  Field,
  FillBox,
  Header,
  HeaderBackButton,
  IconButton,
  IconSpinner,
  Icons,
  List,
  LoadingDialog,
  MenuItem,
  Select,
  TextField,
  ThemeModeToggleButtons,
  Typography,
  ViewNode,
} from '@gamezilla/shared/ui';
import { AlertTitle } from '@mui/material';
import { FrontendModel, FrontendMsg, ToFrontend } from './profile.types';

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init: Model = {
  profiles: {},
  requests: {},
};

//
//
//
// update
//
//
//

export type Msg = FrontendMsg;

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
  switch (msg.t) {
    default: {
      return { model };
    }
  }
};

export const updateFromBackend = ({
  msg,
  model,
}: {
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
} => {
  switch (msg.t) {
    default: {
      return { model };
    }
  }
};

export const updateFromApp = ({
  msg,
  model,
}: {
  msg: AppMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'route-changed') {
    const route = msg.route;
    if (route.t !== 'profile') {
      return { model };
    }
    return { model };
  }

  if (msg.t === 'user-logged-in') {
    return { model };
  }

  return { model };
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
//
// view
//
//
//

export const View = ({
  model,
  route,
  $send,
  ctx,
  viewBottomBar,
}: {
  ctx: ViewCtx;
  model: Model;
  route: Route.RouteProfile;
  $send: (msg: Msg) => void;
  viewBottomBar: ViewNode;
}) => {
  if (route.t === 'profile') {
    return (
      <>
        <ViewProfileScreen
          model={model}
          ctx={ctx}
          $send={$send}
          userId={route.userId}
        />
        {viewBottomBar}
      </>
    );
  }

  if (route.t === 'profile-delete') {
    return <ViewDeleteScreen $send={$send} ctx={ctx} model={model} />;
  }

  if (route.t === 'profile-update') {
    return <ViewUpdateScreen $send={$send} ctx={ctx} model={model} />;
  }

  if (route.t === 'profile-update-username') {
    return <ViewUpdateUsernameScreen $send={$send} ctx={ctx} model={model} />;
  }

  if (route.t === 'profile-update-avatar') {
    return <ViewUpdateAvatarScreen $send={$send} ctx={ctx} model={model} />;
  }

  if (route.t === 'profile-update-theme') {
    return <ViewUpdateThemeScreen $send={$send} ctx={ctx} model={model} />;
  }

  const check: never = route;
  return check;
};

const ViewProfileScreen = ({
  model,
  ctx,
  userId,
}: {
  ctx: ViewCtx;
  userId: UserId;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const profile = model.profiles[userId];

  if (!profile) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <IconSpinner />
      </div>
    );
  }

  if (profile.userId === ctx.currentUserId) {
    return (
      <FillBox>
        <Header
          title={profile.username}
          right={
            <IconButton edge="end">
              <Icons.Menu />
            </IconButton>
          }
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            overflowX: 'hidden',
          }}
        >
          <Avatar
            sx={{ width: 120, height: 120, marginBottom: 1 }}
            src={profile.avatarUrl}
          />
          <Typography
            variant="h4"
            sx={{ maxWidth: '100%', marginBottom: 2 }}
            noWrap
          >
            {profile.username}
          </Typography>
          <Button
            fullWidth
            variant="contained"
            size="small"
            sx={{ marginBottom: 2 }}
          >
            Edit Profile
          </Button>
        </Box>
      </FillBox>
    );
  }

  return (
    <div>
      <Header
        left={
          <HeaderBackButton
            onClick={() => {
              //
            }}
          />
        }
        title={profile.username}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflowX: 'hidden',
          p: 2,
        }}
      >
        <Avatar
          sx={{ width: 120, height: 120, marginBottom: 1 }}
          src={profile.avatarUrl}
        />
        <Typography
          variant="h4"
          sx={{ maxWidth: '100%', marginBottom: 2 }}
          noWrap
        >
          {profile.username}
        </Typography>
      </Box>
    </div>
  );
};

const ViewDeleteScreen = (_props: {
  model: Model;
  ctx: ViewCtx;
  $send: (msg: Msg) => void;
}) => {
  const mutation = {
    type: 'NotAsked',
  } as RemoteData<string, null>;

  switch (mutation.type) {
    case 'Loading':
      return <LoadingDialog open title="Deleting profile..." />;

    case 'Err':
      return (
        <Backdrop open>
          <Alert variant="filled" severity="error" sx={{ margin: 2 }}>
            <AlertTitle>Failed to delete profile.</AlertTitle>
            {mutation.error}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 2,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                color="inherit"
                startIcon={<Icons.Close />}
              >
                Close
              </Button>
            </Box>
          </Alert>
        </Backdrop>
      );

    case 'NotAsked':
    case 'Ok':
      return (
        <ConformationDialog
          open
          title="Delete profile forever?"
          confirmTitle="Delete"
          onCancel={() => {
            //
          }}
          onClose={() => {
            //
          }}
          onConfirm={() => {
            //
          }}
        />
      );
  }
};

const ViewUpdateScreen = ({
  ctx,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const profile = ctx.profiles[ctx.currentUserId];
  return (
    <FillBox>
      <Header
        left={
          <HeaderBackButton
            onClick={() => {
              //
            }}
          />
        }
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
      />

      <Button sx={{ display: 'block', marginX: 'auto', marginBottom: 2 }}>
        Change Avatar
      </Button>

      <List>
        <Field label="Username" value={profile?.username ?? '...'} />
        <Field label="Theme" value={profile?.themeMode ?? '...'} />
      </List>
    </FillBox>
  );
};

const ViewUpdateUsernameScreen = (_props: {
  model: Model;
  $send: (msg: Msg) => void;
  ctx: ViewCtx;
}) => (
  <FillBox>
    <Header
      left={<Button sx={{ marginLeft: -1 }}>Cancel</Button>}
      title="Username"
      right={<Button sx={{ marginRight: -1 }}>Done</Button>}
    />

    <Box sx={{ p: 2, width: '100%' }}>
      <TextField sx={{ marginBottom: 4 }} label="Username" fullWidth />
    </Box>
  </FillBox>
);

const ViewUpdateThemeScreen = (_props: {
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => (
  <FillBox>
    <Header
      left={
        <HeaderBackButton
          onClick={() => {
            //
          }}
        />
      }
      title="Theme"
    />

    <LoadingDialog title="Updating theme..." open={false} />

    <Box sx={{ padding: 2 }}>
      <ThemeModeToggleButtons
        themeMode={'Dark'}
        onChange={() => {
          //
        }}
      />
    </Box>
  </FillBox>
);

const ViewUpdateAvatarScreen = (_props: {
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <FillBox>
      <Header
        left={<Button sx={{ marginLeft: -1 }}>Cancel</Button>}
        title="Avatar"
        right={<Button sx={{ marginRight: -1 }}>Done</Button>}
      />

      <Avatar
        sx={{
          marginX: 'auto',
          width: '150px',
          height: '150px',
          marginBottom: 1,
        }}
      />

      <LoadingDialog open={false} title="Updating avatar..." />

      <Box sx={{ padding: 2 }}>
        <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Style
        </Typography>
        <Select
          sx={{ marginBottom: 2 }}
          open={false}
          fullWidth
          renderValue={() => (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Avatar
                sx={{ marginRight: 1, width: 24, height: 24 }}
                src={ProfileAvatar.toUrl({
                  style: 'adventurer',
                  seed: ProfileAvatar.toSeed('123'),
                })}
              />
              <Typography>{ProfileAvatar.formatStyle('adventurer')}</Typography>
            </Box>
          )}
        >
          {ProfileAvatar.ALL_STYLES.map((style) => (
            <MenuItem
              key={style}
              value={style}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Avatar
                sx={{ marginRight: 1 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed('123'),
                })}
              />
              <Typography>{ProfileAvatar.formatStyle(style)}</Typography>
            </MenuItem>
          ))}
        </Select>

        <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Seed
        </Typography>

        <TextField
          fullWidth
          onChange={() => {
            //
          }}
          sx={{ marginBottom: 2 }}
        />

        <Button fullWidth variant="outlined" sx={{ marginBottom: 4 }}>
          Random Seed
        </Button>
      </Box>
    </FillBox>
  );
};
