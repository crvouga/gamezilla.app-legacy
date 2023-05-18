import { Browser, RemoteResult, Result } from '@gamezilla/shared/core';
import { UserId, Username } from '@gamezilla/shared/app';

type SearchResult = {
  t: 'profile';
  id: string;
  userId: UserId;
  username: Username;
  avatarUrl: string;
};

export type FrontendModel = {
  searchText: string;
  searchResults: {
    [id: string]: SearchResult;
  };
  requests: {
    [searchText: string]: RemoteResult<string, null>;
  };
};

export type ServerModel = null;

export type ToBackend = Req;

export type ToFrontend = Res;

export type ServerMsg = { t: 'none' };

export type FrontendMsg =
  | Req
  | { t: 'clicked-clear' }
  | { t: 'focus-done'; result: Browser.FocusResult }
  | { t: 'inputted-search-text'; searchText: string }
  | { t: 'clicked-result'; userId: UserId };

export type Req = { t: 'search'; searchText: string };

export type Res = Req & { result: Result<string, SearchResult[]> };
