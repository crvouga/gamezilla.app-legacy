import { Account, Auth, Logout, PageLogin } from '@gamezilla/auth';
import { Cmd, exhaustive, p, Sub, t } from '@gamezilla/core';
import {
  PageProfile,
  PageProfileCreate,
  PageProfileDelete,
  PageProfileSearch,
  PageProfileUpdate,
  ProfileStore,
} from '@gamezilla/profile';
import { RoomFrontend } from '@gamezilla/room';
import {
  Alerts,
  Ctx,
  RoomId,
  Route,
  UserId,
  Username,
} from '@gamezilla/shared';
import {
  Box,
  ButtonBase,
  Icons,
  LoadingPage,
  Typography,
  useTheme,
  ViewNode,
} from '@gamezilla/shared/ui';

//
//
//
// Model
//
//
//

export type Model =
  | ['loading']
  | ['login', PageLogin.Model]
  | ['profile-create', PageProfileCreate.Model]
  | ['logout', Logout.Model]
  | ['account', Account.Model]
  | ['profile', { userId: UserId }, PageProfile.Model]
  | ['profile-delete', PageProfileDelete.Model]
  | ['profile-update', PageProfileUpdate.Model]
  | ['search', PageProfileSearch.Model]
  | ['room', RoomId]
  | ['room-list'];

//
//
//
// Msg
//
//
//

export type Msg =
  | ['account', Account.Msg]
  | ['login', PageLogin.Msg]
  | ['logout', Logout.Msg]
  | ['profile', PageProfile.Msg]
  | ['profile-create', PageProfileCreate.Msg]
  | ['profile-delete', PageProfileDelete.Msg]
  | ['profile-update', PageProfileUpdate.Msg]
  | ['search', PageProfileSearch.Msg]
  | ['clicked-bottom-nav-link', Route.Model];

export type OutAction =
  | Alerts.Action
  | Auth.Action
  | Route.Action
  | ProfileStore.Action;

//
//
//
// Init
//
//
//

export const initLoading = (): Model => {
  return ['loading'];
};

export const initReady = ({
  route,
  profileStore,
  currentUserId,
}: {
  route: Route.Model;
  profileStore: ProfileStore.Model;
  currentUserId: UserId;
}): [Model, Cmd<Msg>, OutAction[]] => {
  switch (route[0]) {
    case 'account':
      return [['account', Account.init], Cmd.None, []];

    case 'logout':
      return [['logout', Logout.init], Cmd.None, []];

    case 'profile-delete': {
      const [modelNew, cmdNew, actions] = PageProfileDelete.init;
      return [
        ['profile-delete', modelNew],
        p(cmdNew, Cmd.map(t('profile-delete'))),
        actions,
      ];
    }

    case 'profile-update-avatar':
    case 'profile-update-name':
    case 'profile-update-username':
    case 'profile-update-theme':
    case 'profile-update': {
      const profile: ProfileStore.Profile = profileStore.profiles[
        currentUserId
      ] ?? {
        userId: currentUserId,
        name: '...',
        username: Username.fromString('...'),
        avatarUrl: '...',
        themeMode: 'Light',
      };
      const initial = PageProfileUpdate.init({
        currentUserProfile: profile,
        route: route,
      });
      return [['profile-update', initial], Cmd.None, []];
    }

    case 'profile': {
      const [modelInit, cmdInit, actions] = PageProfile.init({
        userId: route[1].userId,
      });
      return [
        ['profile', { userId: route[1].userId }, modelInit],
        p(cmdInit, Cmd.map(t('profile'))),
        actions,
      ];
    }

    case 'search': {
      const [modelInit, cmdInit, actionsInit] = PageProfileSearch.init;
      return [
        ['search', modelInit],
        p(cmdInit, Cmd.map(t('search'))),
        actionsInit,
      ];
    }

    case 'room': {
      return [['room', route[1]], Cmd.None, []];
    }

    case 'room-list': {
      return [['room-list'], Cmd.None, []];
    }

    default: {
      return [['room-list'], Route.push(['room-list']), []];
    }
  }
};

export const initLoggedOut = ({
  route,
  model,
}: {
  route: Route.Model;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (route[0]) {
    case 'login':
    case 'login-phone':
    case 'login-email-link':
    case 'login-phone-verify': {
      if (model[0] !== 'login') {
        const initial = PageLogin.init({
          route,
          model: { type: 'login', child: 'idle' },
        });
        return {
          model: ['login', initial.model],
          cmd: Cmd.tag('login', initial.cmd ?? Cmd.None),
        };
      }
      const initial = PageLogin.init({
        route,
        model: model[1],
      });
      return {
        model: ['login', initial.model],
        cmd: Cmd.tag('login', initial.cmd ?? Cmd.None),
      };
    }
    default: {
      const initial = PageLogin.init({
        route,
        model: { type: 'login', child: 'idle' },
      });
      return {
        model: ['login', initial.model],
        cmd: Cmd.tag('login', initial.cmd ?? Cmd.None),
      };
    }
  }
};

//
//
//
// Update
//
//
//

export const updateReady = ({
  currentUserId,
  msg,
  model,
}: {
  currentUserId: UserId;
  msg: Msg;
  model: Model;
}): [Model, Cmd<Msg>, OutAction[]] => {
  if (msg[0] === 'clicked-bottom-nav-link') {
    return [model, Route.push(msg[1]), []];
  }

  switch (model[0]) {
    case 'account':
      if (msg[0] === 'account') {
        const [modelNew, cmdNew] = Account.update(msg[1], model[1]);
        return [['account', modelNew], Cmd.tag('account', cmdNew), []];
      }
      return [model, Cmd.None, []];

    case 'logout':
      if (msg[0] === 'logout') {
        return tag('logout', Logout.update(msg[1], model[1]));
      }
      return [model, Cmd.None, []];

    case 'profile-delete':
      if (msg[0] === 'profile-delete') {
        return tag(
          'profile-delete',
          PageProfileDelete.update({
            currentUserId,
            msg: msg[1],
            model: model[1],
          })
        );
      }
      return [model, Cmd.None, []];

    case 'profile-update': {
      if (msg[0] !== 'profile-update') {
        return [model, Cmd.None, []];
      }
      const updated = PageProfileUpdate.update({
        msg: msg[1],
        model: model[1],
        currentUserId,
      });
      return [
        ['profile-update', updated.model],
        Cmd.tag('profile-update', updated.cmd ?? Cmd.None),
        updated.actions ?? [],
      ];
    }

    case 'profile':
      if (msg[0] === 'profile') {
        const [modelPage, cmdPage, actions] = PageProfile.update(
          msg[1],
          model[2]
        );
        return [
          ['profile', model[1], modelPage],
          p(cmdPage, Cmd.map(t('profile'))),
          actions,
        ];
      }

      return [model, Cmd.None, []];

    case 'search':
      if (msg[0] === 'search') {
        return tag('search', PageProfileSearch.update(msg[1], model[1]));
      }

      return [model, Cmd.None, []];

    case 'room': {
      return [model, Cmd.None, []];
    }

    case 'room-list': {
      return [model, Cmd.None, []];
    }

    case 'loading':
    case 'login':
    case 'profile-create': {
      return [model, Route.push(['room-list']), []];
    }

    default: {
      return exhaustive(model);
    }
  }
};

export const updateLoggedOut = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (model[0]) {
    case 'login': {
      if (msg[0] !== 'login') {
        return { model };
      }
      const updated = PageLogin.update({ msg: msg[1], model: model[1] });
      return {
        model: ['login', updated.model],
        cmd: Cmd.tag('login', updated.cmd ?? Cmd.None),
      };
    }

    default: {
      return { model };
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const ViewReady = ({
  room,
  route,
  model,
  profileStore,
  $send,
  $sendRoom,
  ctx,
}: {
  ctx: Ctx;
  route: Route.Model;
  room: RoomFrontend.Model;
  profileStore: ProfileStore.Model;
  model: Model;
  $sendRoom: (msg: RoomFrontend.Msg) => void;
  $send: (msg: Msg) => void;
}) => {
  switch (model[0]) {
    case 'account':
      return (
        <>
          <Account.View
            username={
              profileStore.profiles[ctx.currentUserId]?.username ?? '...'
            }
            model={model[1]}
            $send={(msg) => $send(['account', msg])}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            room={room}
            ctx={ctx}
            route={route}
            $send={$send}
          />
        </>
      );

    case 'search':
      return (
        <>
          <PageProfileSearch.View
            $send={(msg) => $send(['search', msg])}
            model={model[1]}
            profileStore={profileStore}
          />

          <ViewBottomBar
            $sendRoom={$sendRoom}
            room={room}
            ctx={ctx}
            route={route}
            $send={$send}
          />
        </>
      );

    case 'logout':
      return (
        <Logout.View model={model[1]} $send={(msg) => $send(['logout', msg])} />
      );

    case 'profile-delete':
      return (
        <PageProfileDelete.View
          profileStore={profileStore}
          ctx={ctx}
          model={model[1]}
          $send={(msg) => $send(['profile-delete', msg])}
        />
      );

    case 'profile-update':
      return (
        <>
          <PageProfileUpdate.View
            ctx={ctx}
            currentUserProfile={
              profileStore.profiles[ctx.currentUserId] ?? {
                username: Username.fromString('...'),
                avatarUrl: '...',
                name: '...',
                themeMode: 'System',
                userId: ctx.currentUserId,
              }
            }
            model={model[1]}
            $send={(msg) => $send(['profile-update', msg])}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            room={room}
            ctx={ctx}
            route={route}
            $send={$send}
          />{' '}
        </>
      );

    case 'profile':
      return (
        <>
          <PageProfile.View
            userId={model[1].userId}
            profileStore={profileStore}
            currentUserId={ctx.currentUserId}
            model={model[2]}
            $send={(msg) => $send(['profile', msg])}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            room={room}
            ctx={ctx}
            route={route}
            $send={$send}
          />
        </>
      );

    case 'room': {
      return (
        <RoomFrontend.View
          roomId={model[1]}
          ctx={ctx}
          model={room}
          $send={$sendRoom}
        />
      );
    }

    case 'room-list': {
      return (
        <>
          <RoomFrontend.ViewPageRoomList
            $send={$sendRoom}
            ctx={ctx}
            model={room}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            room={room}
            ctx={ctx}
            route={route}
            $send={$send}
          />
        </>
      );
    }

    case 'loading':
    case 'login':
    case 'profile-create':
      return <LoadingPage />;

    default:
      return exhaustive(model);
  }
};

export const ViewLoggedOut = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  switch (model[0]) {
    case 'login':
      return (
        <PageLogin.View
          model={model[1]}
          $send={(msg) => $send(['login', msg])}
        />
      );
    default: {
      return <LoadingPage />;
    }
  }
};

//
//
//
//
//
//
//
//

const ViewBottomBar = ({
  ctx,
  route,
  room,
  $send,
  $sendRoom,
}: {
  ctx: Ctx;
  route: Route.Model;
  $send: (m: Msg) => void;
  room: RoomFrontend.Model;
  $sendRoom: (m: RoomFrontend.Msg) => void;
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <RoomFrontend.ViewBar ctx={ctx} model={room} $send={$sendRoom} />

      <ViewBottomNavigation ctx={ctx} route={route} $send={$send} />
    </Box>
  );
};

const ViewBottomNavigation = ({
  route,
  $send,
  ctx,
}: {
  ctx: Ctx;
  route: Route.Model;
  $send: (msg: Msg) => void;
}) => {
  const items: {
    route: Route.Model;
    label: string;
    filled: ViewNode;
    outlined: ViewNode;
  }[] = [
    {
      route: ['room-list'],
      label: 'Rooms',
      filled: <Icons.SportsEsports />,
      outlined: <Icons.SportsEsportsOutlined />,
    },
    {
      route: ['search'],
      label: 'Search',
      filled: <Icons.Search />,
      outlined: <Icons.SearchOutlined />,
    },
    {
      route: ['chat-list'],
      label: 'Chat',
      filled: <Icons.Chat />,
      outlined: <Icons.ChatOutlined />,
    },
    {
      route: ['profile', { userId: ctx.currentUserId }],
      label: 'Profile',
      filled: <Icons.AccountCircle />,
      outlined: <Icons.AccountCircleOutlined />,
    },
  ];

  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderTop: `1.5px solid ${theme.palette.divider}`,
      }}
    >
      {items.map((item) => {
        const isSelected = Route.equals(route, item.route);

        return (
          <ButtonBase
            key={Route.encode(item.route)}
            onClick={() => $send(['clicked-bottom-nav-link', item.route])}
            sx={{
              color: isSelected ? 'primary.main' : 'text.secondary',
              paddingY: 0,
              paddingX: 2,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              width: '100%',
            }}
          >
            {isSelected ? item.filled : item.outlined}
            <Typography variant="caption">{item.label}</Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
};

//
//
//
// Helpers
//
//
//

const tag = <TModel, TMsg, TAction, TPage extends Msg[0]>(
  page: TPage,
  [modelPrev, cmdPrev, actionsPrev = []]:
    | [TModel, Cmd<TMsg>, TAction[]]
    | [TModel, Cmd<TMsg>]
): [[TPage, TModel], Cmd<[TPage, TMsg]>, TAction[]] => {
  return [[page, modelPrev], p(cmdPrev, Cmd.map(t(page))), actionsPrev];
};
