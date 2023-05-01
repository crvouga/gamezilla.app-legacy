import { Cmd, RemoteData } from '@gamezilla/core';
import {
  AppMsg,
  ProfileAvatar,
  Route,
  UserId,
  ViewCtx,
} from '@gamezilla/shared';
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  ConformationDialog,
  FillBox,
  IconArrowLeftOnRect,
  IconBars3,
  IconButton,
  IconChevronRight,
  IconSpinner,
  Icons,
  LoadingDialog,
  MenuItem,
  MyAvatar,
  MyButton,
  MyTextField,
  Select,
  TextField,
  ThemeModeToggleButtons,
  TopBar,
  TopBarBackButton,
  Typography,
  ViewNode,
} from '@gamezilla/shared/ui';
import { AlertTitle } from '@mui/material';
import {
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './profile.types';

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
  sendToBackend,
}: {
  msg: Msg;
  model: Model;
  sendToBackend: (m: ToBackend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'inputted-username') {
    return {
      model: { ...model, draft: { ...model.draft, username: msg.username } },
    };
  }

  if (msg.t === 'clicked-menu-button') {
    return { model: { ...model, opened: 'menu' } };
  }

  if (msg.t === 'closed-menu') {
    return { model: { ...model, opened: null } };
  }

  return { model, cmd: sendToBackend(msg) };
};

export const updateFromBackend = ({
  msg,
  model,
}: {
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.result.type === 'Err') {
    return { model };
  }

  const profilesNew = msg.result.value.reduce<Model['profiles']>(
    (acc, profile) => {
      return {
        ...acc,
        [profile.userId]: profile,
      };
    },
    model.profiles
  );

  const modelNew: Model = {
    ...model,
    profiles: profilesNew,
  };

  return {
    model: modelNew,
  };
};

export const updateFromApp = ({
  msg,
  model,
  sendToBackend,
}: {
  msg: AppMsg;
  model: Model;
  sendToBackend: (m: ToBackend) => Cmd<Msg>;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'route-changed') {
    const route = msg.route;
    if (route.t !== 'profile') {
      return { model };
    }

    if (route.c.t === 'profile') {
      return {
        model,
        cmd: sendToBackend({ t: 'find-many', userIds: [route.c.userId] }),
      };
    }

    return { model };
  }

  if (msg.t === 'user-logged-in') {
    return {
      model,
      cmd: sendToBackend({ t: 'find-else-create', userId: msg.currentUserId }),
    };
  }

  return { model };
};

//
//
//
// View
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
      <div className="relative w-full h-full flex flex-col">
        <ViewProfileScreen
          model={model}
          ctx={ctx}
          $send={$send}
          userId={route.userId}
        />

        {viewBottomBar}

        {model.opened === 'menu' && (
          <div
            tabIndex={0}
            className="absolute top-0 left-0 w-full h-full bg-black/50 flex flex-col justify-end z-10 "
            onClick={() => $send({ t: 'closed-menu' })}
          >
            <div
              className="bg-neutral-800"
              onClick={(event) => {
                event.stopPropagation();
                console.log('');
              }}
            >
              <button className="flex items-center justify-start w-full p-4 gap-2">
                Edit Profile
              </button>
            </div>

            <div
              className="bg-neutral-800"
              onClick={(event) => {
                event.stopPropagation();
                console.log('');
              }}
            >
              <button className="flex items-center justify-start text-red-500 w-full p-4 gap-2">
                Delete Profile
              </button>
            </div>

            <div
              className="bg-neutral-800"
              onClick={(event) => {
                event.stopPropagation();
                console.log('');
              }}
            >
              <button className="flex items-center justify-start text-red-500 w-full p-4 gap-2">
                <IconArrowLeftOnRect />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
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
  $send,
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
        <IconSpinner className="w-12 h-12" />
      </div>
    );
  }

  if (profile.userId === ctx.currentUserId) {
    return (
      <div className="w-full h-full">
        <TopBar
          title={profile.username}
          right={
            <IconButton onClick={() => $send({ t: 'clicked-menu-button' })}>
              <IconBars3 />
            </IconButton>
          }
        />

        <div className="flex flex-col items-center justify-center p-4 gap-4 overflow-x-hidden">
          <MyAvatar
            className="w-28 h-28"
            src={profile.avatarUrl}
            alt="profile avatar"
          />
          <p className="text-3xl w-full text-center overflow-hidden text-ellipsis">
            @{profile.username}
          </p>
          <MyButton
            onClick={() =>
              ctx.$push({ t: 'profile', c: { t: 'profile-update' } })
            }
            className="w-full"
          >
            Edit Profile
          </MyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <TopBar
        left={<TopBarBackButton onClick={ctx.$back} />}
        title={profile.username}
      />
      <div className="flex flex-col items-center justify-center gap-4 p-4 overflow-x-hidden">
        <MyAvatar alt="profile avatar" src={profile.avatarUrl} />
        <p className="text-xl w-full overflow-hidden text-ellipsis">
          {profile.username}
        </p>
      </div>
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
    <div className="w-full h-full flex flex-col items-center gap-3">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() =>
              ctx.$push({
                t: 'profile',
                c: { t: 'profile', userId: ctx.currentUserId },
              })
            }
          />
        }
        title="Update Profile"
      />

      <MyAvatar
        src={profile?.avatarUrl ?? '...'}
        className="w-28 h-28"
        alt="profile avatar"
        onClick={() =>
          ctx.$push({ t: 'profile', c: { t: 'profile-update-avatar' } })
        }
      />

      <MyButton
        size="sm"
        color="primary"
        variant="text"
        className="block"
        onClick={() =>
          ctx.$push({ t: 'profile', c: { t: 'profile-update-avatar' } })
        }
      >
        Change Avatar
      </MyButton>

      <div className="w-full flex flex-col gap-2">
        <ViewField
          onClick={() =>
            ctx.$push({ t: 'profile', c: { t: 'profile-update-username' } })
          }
          label="Username"
          value={profile?.username ?? '...'}
        />
        <ViewField
          onClick={() =>
            ctx.$push({ t: 'profile', c: { t: 'profile-update-theme' } })
          }
          label="Theme"
          value={profile?.themeMode ?? '...'}
        />
      </div>
    </div>
  );
};

export const ViewField = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex justify-start items-center px-4 py-2"
  >
    <div className="flex-1 flex flex-col items-start">
      <p className="text-sm text-neutral-300">{label}</p>
      <p className="text-lg">{value}</p>
    </div>

    <IconChevronRight />
  </button>
);

const ViewUpdateUsernameScreen = ({
  ctx,
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
  ctx: ViewCtx;
}) => {
  const inputVal =
    model.draft?.username ?? model.profiles[ctx.currentUserId]?.username ?? '';
  return (
    <div className="w-full h-full flex flex-col">
      <TopBar
        left={
          <MyButton
            variant="text"
            color="primary"
            onClick={() =>
              ctx.$push({ t: 'profile', c: { t: 'profile-update' } })
            }
          >
            Cancel
          </MyButton>
        }
        title="Username"
        right={
          <MyButton
            variant="text"
            color="primary"
            onClick={() => {
              const username = model.draft?.username;
              if (username) {
                $send({ t: 'change-username', username });
              }
            }}
          >
            Done
          </MyButton>
        }
      />

      <div className="w-full p-4">
        <MyTextField
          label="Username"
          value={inputVal}
          id={'username'}
          onChange={(username) => $send({ t: 'inputted-username', username })}
        />
      </div>
    </div>
  );
};

const ViewUpdateThemeScreen = (_props: {
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => (
  <FillBox>
    <TopBar
      left={
        <TopBarBackButton
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
      <TopBar
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
