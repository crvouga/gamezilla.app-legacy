import { Browser, Cmd, matchSort, p } from '@gamezilla/core';
import { Route } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import { FrontendModel, FrontendMsg, ToBackend } from './search.types';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: {
  model: Model;
} = {
  model: {
    searchText: '',
    searchResults: {},
    requests: {},
  },
};

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

const searchInputId = 'SearchInput';

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
  if (msg.t === 'focus-done') {
    return { model };
  }

  if (msg.t === 'clicked-clear') {
    return {
      model: { ...model, searchText: '' },
      cmd: p(
        Browser.focus(searchInputId),
        Cmd.perform((result) => ({ t: 'focus-done', result }))
      ),
    };
  }

  if (msg.t === 'clicked-result') {
    return {
      model,
      cmd: Route.push({
        t: 'profile',
        c: { t: 'profile', userId: msg.userId },
      }),
    };
  }

  if (msg.t === 'inputted-search-text') {
    return {
      model: { ...model, searchText: msg.searchText },
    };
  }

  return { model, cmd: sendToBackend(msg) };
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
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const request = model.requests[model.searchText] ?? { type: 'NotAsked' };
  const results = matchSort(
    Object.values(model.searchResults),
    (item) => item.username,
    model.searchText
  );

  return (
    <UI.FillBox>
      <UI.InputBase
        sx={{ width: '100%', paddingY: 1, paddingX: 2 }}
        placeholder="Search"
        value={model.searchText}
        onChange={(event) =>
          $send({ t: 'inputted-search-text', searchText: event.target.value })
        }
        endAdornment={
          <UI.InputAdornment position="end">
            {request.type === 'Loading' && <UI.CircularProgress size={24} />}
            <UI.IconButton
              edge="end"
              onClick={() => $send({ t: 'clicked-clear' })}
            >
              <UI.Icons.Close />
            </UI.IconButton>
          </UI.InputAdornment>
        }
      />

      <UI.Divider />

      {results.length === 0 && (
        <UI.Typography sx={{ paddingX: 2 }} color="text.secondary">
          {request.type === 'Loading' ? 'Searching...' : 'No results found'}
        </UI.Typography>
      )}

      <UI.List sx={{ overflowY: 'scroll' }}>
        {results.map((result) => (
          <UI.ListItemButton
            key={result.userId}
            sx={{ width: '100%' }}
            onClick={() =>
              $send({ t: 'clicked-result', userId: result.userId })
            }
          >
            <UI.ListItemAvatar>
              <UI.Avatar src={result.avatarUrl} />
            </UI.ListItemAvatar>
            <UI.ListItemText
              primaryTypographyProps={{ noWrap: true }}
              primary={result.username}
            />
            <UI.ListItemSecondaryAction>
              <UI.Icons.ChevronRight />
            </UI.ListItemSecondaryAction>
          </UI.ListItemButton>
        ))}
      </UI.List>
    </UI.FillBox>
  );
};
