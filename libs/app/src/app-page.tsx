import { Account, Auth, Logout, PageLogin } from '@gamezilla/auth';
import { Chat, ChatConversation, ChatNew, ChatStore } from '@gamezilla/chat';
import { Cmd, exhaustive, p, Sub, t } from '@gamezilla/core';
import { PartyFrontend as Party } from '@gamezilla/party';
import {
  PageProfile,
  PageProfileCreate,
  PageProfileDelete,
  PageProfileSearch,
  PageProfileUpdate,
  ProfileStore,
} from '@gamezilla/profile';
import { RoomFrontend } from '@gamezilla/room';
import { Alerts, Ctx, Route, UserId } from '@gamezilla/shared';
import {
  Box,
  ButtonBase,
  FillBox,
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
  | ['chat', Chat.Model]
  | ['chat-new', ChatNew.Model]
  | ['search', PageProfileSearch.Model]
  | ['chat-conversation', { conversationId: string }, ChatConversation.Model]
  | ['home']
  | ['room']
  | ['room-game']
  | ['party'];

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
  | ['chat', Chat.Msg]
  | ['party', Party.Msg]
  | ['chat-new', ChatNew.Msg]
  | ['chat-conversation', ChatConversation.Msg]
  | ['clicked-bottom-nav-link', Route.Model];

export type OutAction =
  | ChatStore.Action
  | Alerts.Action
  | RoomFrontend.Action
  | Auth.Action
  | Party.Action
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

export const initReady = (
  route: Route.Model,
  profile: ProfileStore.Profile
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (route[0]) {
    case 'account':
      return [['account', Account.init], Cmd.None, []];

    case 'chat': {
      const [model, cmd, actions] = Chat.init(profile);
      return [['chat', model], p(cmd, Cmd.map(t('chat'))), actions];
    }

    case 'chat-new': {
      const [chatNew, chatNewCmd, actions] = ChatNew.init();

      return [
        ['chat-new', chatNew],
        p(chatNewCmd, Cmd.map(t('chat-new'))),
        actions,
      ];
    }

    case 'chat-conversation': {
      const [child, cmd, actions] = ChatConversation.init({
        conversationId: route[1].conversationId,
      });
      return [
        ['chat-conversation', route[1], child],
        Cmd.tag('chat-conversation', cmd),
        actions,
      ];
    }

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
      return [['room'], Cmd.None, []];
    }

    case 'room-game': {
      return [['room-game'], Cmd.None, []];
    }

    case 'party': {
      return [['party'], Cmd.None, []];
    }

    case 'home': {
      return [['home'], Cmd.None, []];
    }

    case 'profile-create':
    case 'login':
    case 'login-phone':
    case 'login-phone-verify':
    case 'login-email-link': {
      return [['home'], Route.push(['home']), []];
    }

    default:
      return exhaustive(route);
  }
};

export const initProfileMissing = (
  route: Route.Model,
  auth: Auth.Session
): [Model, Cmd<Msg>] => {
  switch (route[0]) {
    case 'profile-create':
      return [['profile-create', PageProfileCreate.init(auth)], Cmd.None];

    case 'logout':
      return [['logout', Logout.init], Cmd.None];

    case 'account':
    case 'chat':
    case 'chat-conversation':
    case 'chat-new':
    case 'search':
    case 'profile':
    case 'profile-delete':
    case 'profile-update':
    case 'profile-update-avatar':
    case 'profile-update-theme':
    case 'profile-update-name':
    case 'profile-update-username':
    case 'login':
    case 'login-email-link':
    case 'login-phone':
    case 'login-phone-verify':
    case 'room-game':
    case 'room':
    case 'home':
    case 'party':
      return [['profile-create', PageProfileCreate.init(auth)], Cmd.None];
    default:
      return exhaustive(route);
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
          model: { type: 'login', child: null },
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
        model: { type: 'login', child: null },
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

export const updateReady = (
  {
    profile,
    profileStore,
  }: {
    profileStore: ProfileStore.Model;
    profile: ProfileStore.Profile;
    gameRoom: RoomFrontend.Model;
  },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
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
          PageProfileDelete.update(profile, msg[1], model[1])
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
        currentUserId: profile.userId,
      });
      return [
        ['profile-update', updated.model],
        Cmd.tag('profile-update', updated.cmd ?? Cmd.None),
        updated.actions ?? [],
      ];
    }

    case 'chat':
      if (msg[0] === 'chat') {
        return tag('chat', Chat.update(msg[1], model[1]));
      }
      return [model, Cmd.None, []];

    case 'chat-new':
      if (msg[0] === 'chat-new') {
        return tag(
          'chat-new',
          ChatNew.update(
            { profileStore: profileStore, currentUserId: profile.userId },
            msg[1],
            model[1]
          )
        );
      }
      return [model, Cmd.None, []];

    case 'chat-conversation':
      if (msg[0] === 'chat-conversation') {
        const [child, cmd, actions] = ChatConversation.update(
          { userId: profile.userId, conversationId: model[1].conversationId },
          msg[1],
          model[2]
        );
        return [
          ['chat-conversation', model[1], child],
          Cmd.tag('chat-conversation', cmd),
          actions,
        ];
      }
      return [model, Cmd.None, []];

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

    case 'room-game': {
      return [model, Cmd.None, []];
    }

    case 'party': {
      if (msg[0] === 'party') {
        return [['party'], Cmd.None, [['party', ['Msg', msg[1]]]]];
      }

      return [model, Cmd.None, []];
    }

    case 'home': {
      return [model, Cmd.None, []];
    }

    case 'loading':
    case 'login':
    case 'profile-create': {
      return [model, Route.push(['home']), []];
    }

    default: {
      return exhaustive(model);
    }
  }
};

export const updateProfileMissing = (
  auth: Auth.Session,
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (model[0]) {
    case 'logout':
      if (msg[0] === 'logout') {
        return tag('logout', Logout.update(msg[1], model[1]));
      }
      return [model, Cmd.None, []];

    case 'profile-create':
      if (msg[0] === 'profile-create') {
        return tag(
          'profile-create',
          PageProfileCreate.update(auth, msg[1], model[1])
        );
      }
      return [model, Cmd.None, []];

    case 'account':
    case 'login':
    case 'profile':
    case 'profile-delete':
    case 'profile-update':
    case 'chat':
    case 'chat-new':
    case 'chat-conversation':
    case 'room-game':
    case 'room':
    case 'search':
    case 'party':
    case 'loading':
    case 'home':
      return [model, Route.push(['profile-create']), []];

    default:
      return exhaustive(model);
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

export const subscriptions = (model: Model): Sub<Msg> => {
  switch (model[0]) {
    case 'chat-new':
      return Sub.tag('chat-new', ChatNew.subscriptions(model[1]));

    case 'account':
    case 'chat':
    case 'chat-conversation':
    case 'login':
    case 'logout':
    case 'profile-create':
    case 'profile-delete':
    case 'profile-update':
    case 'profile':
    case 'search':
    case 'room-game':
    case 'room':
    case 'party':
    case 'loading':
    case 'home':
      return Sub.None;

    default:
      return exhaustive(model);
  }
};

//
//
//
// View
//
//
//

export const ViewReady = ({
  profile,
  gameRoom,
  chatStore,
  route,
  party,
  model,
  profileStore,
  $send,
  $sendRoom,
  ctx,
}: {
  ctx: Ctx;
  route: Route.Model;

  gameRoom: RoomFrontend.Model;
  profile: ProfileStore.Profile;
  chatStore: ChatStore.Model;
  profileStore: ProfileStore.Model;
  party: Party.Model;
  model: Model;
  $sendRoom: (msg: RoomFrontend.Msg) => void;
  $send: (msg: Msg) => void;
}) => {
  switch (model[0]) {
    case 'account':
      return (
        <FillBox>
          <Account.View
            username={profile.username}
            model={model[1]}
            $send={(msg) => $send(['account', msg])}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            gameRoom={gameRoom}
            ctx={ctx}
            route={route}
            $send={$send}
          />
        </FillBox>
      );

    case 'chat':
      return (
        <FillBox>
          <Chat.View
            ctx={ctx}
            model={model[1]}
            $send={(msg) => $send(['chat', msg])}
            chatStore={chatStore}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            gameRoom={gameRoom}
            ctx={ctx}
            route={route}
            $send={$send}
          />
        </FillBox>
      );

    case 'search':
      return (
        <FillBox>
          <PageProfileSearch.View
            $send={(msg) => $send(['search', msg])}
            model={model[1]}
            profileStore={profileStore}
          />

          <ViewBottomBar
            $sendRoom={$sendRoom}
            gameRoom={gameRoom}
            ctx={ctx}
            route={route}
            $send={$send}
          />
        </FillBox>
      );

    case 'chat-new':
      return (
        <FillBox>
          <ChatNew.View
            profileStore={profileStore}
            chatStore={chatStore}
            ctx={ctx}
            model={model[1]}
            $send={(msg) => $send(['chat-new', msg])}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            gameRoom={gameRoom}
            ctx={ctx}
            route={route}
            $send={$send}
          />{' '}
        </FillBox>
      );

    case 'chat-conversation':
      return (
        <ChatConversation.View
          ctx={ctx}
          chatStore={chatStore}
          model={model[2]}
          conversationId={model[1].conversationId}
          $send={(msg) => $send(['chat-conversation', msg])}
        />
      );

    case 'logout':
      return (
        <Logout.View model={model[1]} $send={(msg) => $send(['logout', msg])} />
      );

    case 'profile-delete':
      return (
        <PageProfileDelete.View
          profileStore={profileStore}
          userId={profile.userId}
          model={model[1]}
          $send={(msg) => $send(['profile-delete', msg])}
        />
      );

    case 'profile-update':
      return (
        <FillBox>
          <PageProfileUpdate.View
            currentUserProfile={profile}
            model={model[1]}
            $send={(msg) => $send(['profile-update', msg])}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            gameRoom={gameRoom}
            ctx={ctx}
            route={route}
            $send={$send}
          />{' '}
        </FillBox>
      );

    case 'profile':
      return (
        <FillBox>
          <PageProfile.View
            userId={model[1].userId}
            profileStore={profileStore}
            currentUserId={profile.userId}
            model={model[2]}
            $send={(msg) => $send(['profile', msg])}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            gameRoom={gameRoom}
            ctx={ctx}
            route={route}
            $send={$send}
          />{' '}
        </FillBox>
      );

    case 'room': {
      return (
        <RoomFrontend.ViewPageRoom
          ctx={ctx}
          model={gameRoom}
          $send={$sendRoom}
        />
      );
    }

    case 'room-game': {
      return (
        <RoomFrontend.ViewPageGame
          ctx={ctx}
          model={gameRoom}
          $send={$sendRoom}
        />
      );
    }

    case 'party': {
      return (
        <FillBox>
          <Party.ViewPage
            ctx={ctx}
            model={party}
            $send={(msg) => $send(['party', msg])}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            gameRoom={gameRoom}
            ctx={ctx}
            route={route}
            $send={$send}
          />{' '}
        </FillBox>
      );
    }

    case 'home': {
      return (
        <FillBox>
          <RoomFrontend.ViewPageRoomList
            $send={$sendRoom}
            ctx={ctx}
            model={gameRoom}
          />
          <ViewBottomBar
            $sendRoom={$sendRoom}
            gameRoom={gameRoom}
            ctx={ctx}
            route={route}
            $send={$send}
          />{' '}
        </FillBox>
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

export const ViewProfileMissing = ({
  model,
  $send,
}: {
  authSession: Auth.Session;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  switch (model[0]) {
    case 'logout':
      return (
        <Logout.View model={model[1]} $send={(msg) => $send(['logout', msg])} />
      );

    case 'profile-create':
      return (
        <PageProfileCreate.View
          model={model[1]}
          $send={(msg) => $send(['profile-create', msg])}
        />
      );

    case 'account':
    case 'chat':
    case 'chat-conversation':
    case 'chat-new':
    case 'profile-delete':
    case 'profile-update':
    case 'login':
    case 'search':
    case 'profile':
    case 'room-game':
    case 'room':
    case 'party':
    case 'home':
    case 'loading':
      return <LoadingPage />;

    default:
      return exhaustive(model);
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
  gameRoom,
  $send,
  $sendRoom,
}: {
  ctx: Ctx;
  route: Route.Model;
  $send: (m: Msg) => void;
  gameRoom: RoomFrontend.Model;
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
      <RoomFrontend.ViewBanner ctx={ctx} model={gameRoom} $send={$sendRoom} />

      <ViewBottomNavigation ctx={ctx} route={route} $send={$send} />
    </Box>
  );
};

type BottomNavigationItem = {
  route: Route.Model;
  label: string;
  filled: ViewNode;
  outlined: ViewNode;
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
  const items: BottomNavigationItem[] = [
    {
      route: ['home'],
      label: 'Game',
      filled: <Icons.SportsEsports />,
      outlined: <Icons.SportsEsportsOutlined />,
    },
    // {
    //   route: ['party'],
    //   filled: <Icons.Group />,
    //   outlined: <Icons.GroupOutlined />,
    // },
    {
      route: ['search'],
      label: 'Search',
      filled: <Icons.Search />,
      outlined: <Icons.SearchOutlined />,
    },
    {
      route: ['chat'],
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
