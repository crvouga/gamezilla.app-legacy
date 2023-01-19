import { Browser, Cmd, p, RemoteData } from '@gamezilla/core';
import { Ctx, Route, UserId } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import * as ChatStore from './chat.store';

//
//
//
// Model
//
//
//

export type Model = {
  text: string;
  focused: FocusedModel;
};

type FocusedModel =
  | {
      type: 'Blurred';
    }
  | {
      type: 'Focused';
      messageId: string;
      copyStatus: 'Failed' | 'NotAsked' | 'Succeeded' | 'Loading';
    };

export const init = ({
  conversationId,
}: {
  conversationId: string;
}): [Model, Cmd<Msg>, OutAction[]] => [
  {
    text: '',
    focused: { type: 'Blurred' },
  },
  Cmd.None,

  [['Chat', ['Conversation', ['FindOne', { conversationId }]]]],
];

//
//
//
// Update
//
//
//

export type Msg =
  | ['ClickedBack']
  | ['ClickedSend']
  | ['ClickedMessage', { messageId: string }]
  | ['ClosedMessageMenu', { messageId: string }]
  | ['ClickedDeleteMessage', { messageId: string }]
  | ['ClickedCopyMessageText', string]
  | ['InputtedText', string]
  | ['ClipboardCopy_Done', Browser.Clipboard.CopyResult];

export type OutAction = ChatStore.Action;

export const update = (
  { userId, conversationId }: { userId: UserId; conversationId: string },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'ClipboardCopy_Done':
      return [{ ...model, focused: { type: 'Blurred' } }, Cmd.None, []];

    case 'ClickedCopyMessageText':
      return [
        model,
        p(
          Browser.Clipboard.copy(msg[1]),
          Cmd.perform((result) => ['ClipboardCopy_Done', result])
        ),
        [],
      ];

    case 'ClickedBack':
      return [model, Route.back, []];

    case 'ClickedSend': {
      const payload = {
        userId,
        conversationId,
        messageText: model.text,
      };

      return [model, Cmd.None, [['Chat', ['Message', ['Send', payload]]]]];
    }

    case 'InputtedText':
      return [{ ...model, text: msg[1] }, Cmd.None, []];

    case 'ClickedMessage':
      return [
        {
          ...model,
          focused: {
            type: 'Focused',
            messageId: msg[1].messageId,
            copyStatus: 'NotAsked',
          },
        },
        Cmd.None,
        [],
      ];

    case 'ClosedMessageMenu':
      return [
        {
          ...model,
          focused: {
            type: 'Blurred',
          },
        },
        Cmd.None,
        [],
      ];

    case 'ClickedDeleteMessage': {
      const { messageId } = msg[1];

      return [
        model,
        Cmd.None,
        [['Chat', ['Message', ['Unsend', { messageId }]]]],
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

export const View = ({
  chatStore,
  ctx,
  model,
  $send,
  conversationId,
}: {
  chatStore: ChatStore.Model;
  ctx: Ctx;
  model: Model;
  conversationId: string;
  $send: (msg: Msg) => void;
}) => {
  const { currentUserId, profiles } = ctx;
  const query =
    chatStore.queries.Conversation.FindOne[conversationId] ??
    RemoteData.NotAsked;

  const filtered = Object.values(chatStore.UsersConversations)
    .filter((conversation) => conversation.conversationId === conversationId)
    .flatMap((joinRecord) => {
      const filtered = Object.values(profiles).filter(
        (profile) =>
          profile.userId === joinRecord.userId &&
          profile.userId !== currentUserId
      );
      return filtered;
    });

  const messages = Object.values(chatStore.Message).filter(
    (message) => message.conversationId === conversationId
  );

  const messageInsertMutation =
    chatStore.mutations.Message.Send[conversationId] ?? RemoteData.NotAsked;

  return (
    <UI.FillBox>
      <UI.Toolbar>
        <UI.Box sx={{ flex: 1 }}>
          <UI.HeaderBackButton onClick={() => $send(['ClickedBack'])} />
        </UI.Box>

        <UI.Box
          sx={{
            flex: 3,
            paddingY: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UI.AvatarGroup>
            {filtered.map((item) => (
              <UI.Avatar key={item.userId} src={item.avatarUrl} />
            ))}
          </UI.AvatarGroup>
          <UI.Typography align="center" noWrap>
            {filtered.map((profile) => profile.username).join(', ')}
          </UI.Typography>
        </UI.Box>
        <UI.Box sx={{ flex: 1 }}></UI.Box>
      </UI.Toolbar>

      <MessageContainer
        isLoading={query.type === 'Loading'}
        scrollKey={String(messages.length)}
      >
        <UI.Box sx={{ flex: 1 }}></UI.Box>

        {messages.map((message) => (
          <ChatMessage
            key={message.messageId}
            message={message}
            currentUserId={currentUserId}
            $send={$send}
            model={model}
            store={chatStore}
          />
        ))}
      </MessageContainer>

      <ChatInput
        value={model.text}
        onChange={(text) => $send(['InputtedText', text])}
        onSend={() => $send(['ClickedSend'])}
        isSending={messageInsertMutation.type === 'Loading'}
      />
    </UI.FillBox>
  );
};

const ChatInput = ({
  value,
  onChange,
  onSend,
  isSending,
}: {
  value: string;
  onChange: (valueNew: string) => void;
  onSend: () => void;
  isSending: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const theme = UI.useTheme();
  const backgroundColor =
    theme.palette.mode === 'light'
      ? theme.palette.grey['100']
      : theme.palette.grey['900'];
  const textColor = theme.palette.getContrastText(backgroundColor);
  return (
    <UI.Paper
      variant="outlined"
      sx={{
        width: '100%',
        display: 'flex',
        paddingX: 2,
        paddingY: 1 / 2,
        backgroundColor,
        borderRadius: theme.spacing(4),
      }}
    >
      <UI.InputBase
        ref={inputRef}
        value={value}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
        sx={{ color: textColor, paddingLeft: 1, flex: 1 }}
        placeholder="Message..."
      />

      <UI.Grow in={value.length > 0}>
        <UI.Button
          variant="text"
          size="large"
          disabled={value.length === 0}
          onClick={() => {
            onSend();

            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
          loading={isSending}
        >
          Send
        </UI.Button>
      </UI.Grow>
    </UI.Paper>
  );
};

const MessageContainer = ({
  scrollKey,
  children,
  isLoading,
}: {
  isLoading: boolean;
  scrollKey: string;
  children: ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollKey]);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  return (
    <UI.Box
      ref={containerRef}
      sx={{
        flex: 1,
        overflowY: 'scroll',
        width: '100%',
        paddingBottom: 2,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 0,
      }}
    >
      {children}
      <div ref={ref} />
      {isLoading && (
        <UI.Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UI.CircularProgress />
        </UI.Box>
      )}
    </UI.Box>
  );
};
const ChatMessage = ({
  message,
  currentUserId,
  model,
  store,
  $send,
}: {
  message: {
    messageId: string;
    message: string;
    userId: UserId;
  };
  currentUserId: UserId;
  model: Model;
  $send: (msg: Msg) => void;
  store: ChatStore.Model;
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    $send(['ClickedMessage', message]);
  };

  const variant = currentUserId === message.userId ? 'sent' : 'received';

  const theme = UI.useTheme();
  const backgroundColor =
    variant === 'sent' ? theme.palette.primary.main : theme.palette.grey['200'];
  const textColor = theme.palette.getContrastText(backgroundColor);

  const [anchorRef, setAnchorRef] = useState<null | HTMLElement>(null);

  return (
    <UI.Box
      sx={{
        paddingY: 1 / 2,
        paddingX: 1,
        width: '100%',
        display: 'flex',
        justifyContent: variant === 'received' ? 'flex-start' : 'flex-end',
      }}
    >
      <UI.Typography
        ref={(ref) => setAnchorRef(ref)}
        onClick={handleClick}
        onContextMenu={handleClick}
        sx={{
          // filter:
          //   model.focused.type === "Focused" &&
          //   model.focused.messageId !== message.messageId
          //     ? "blur(4px)"
          //     : undefined,
          borderRadius: theme.spacing(2),
          display: 'inline-block',
          padding: 1,
          backgroundColor,
          color: textColor,
          cursor: model.focused.type === 'Blurred' ? 'pointer' : 'default',
          maxWidth: '80%',
          wordBreak: 'break-all',
        }}
      >
        {message.message}
      </UI.Typography>
      <UI.Menu
        anchorEl={anchorRef}
        open={
          model.focused.type === 'Focused' &&
          model.focused.messageId === message.messageId
        }
        onClose={() => $send(['ClosedMessageMenu', message])}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: variant === 'sent' ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: variant === 'sent' ? 'right' : 'left',
        }}
      >
        <UI.Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <UI.Button
            loading={
              model.focused.type === 'Focused' &&
              model.focused.copyStatus === 'Loading'
            }
            onClick={() => $send(['ClickedCopyMessageText', message.message])}
          >
            {model.focused.type === 'Focused' &&
            model.focused.copyStatus === 'Succeeded'
              ? 'Copied'
              : 'Copy Text'}
          </UI.Button>
          {variant === 'sent' && (
            <UI.Button
              loading={
                store.mutations.Message.Unsend[message.messageId]?.type ===
                'Loading'
              }
              onClick={() => $send(['ClickedDeleteMessage', message])}
            >
              Delete Forever
            </UI.Button>
          )}
        </UI.Box>
      </UI.Menu>
    </UI.Box>
  );
};
