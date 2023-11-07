import { Browser, RemoteResult, Result } from "gamezilla/@SHARED/core";
import { UserId, Username } from "gamezilla/@CHILD/app/@SHARED/data";

type SearchResult = {
  t: "profile";
  id: string;
  userId: UserId;
  username: Username;
  avatarUrl: string;
};

export type ClientModel = {
  searchText: string;
  searchResults: {
    [id: string]: SearchResult;
  };
  requests: {
    [searchText: string]: RemoteResult<string, null>;
  };
};

export type ServerModel = null;

export type ToServer = Req;

export type ToClient = Res;

export type ServerMsg = { t: "none" };

export type ClientMsg =
  | Req
  | { t: "clicked-clear" }
  | { t: "focus-done"; result: Browser.FocusResult }
  | { t: "inputted-search-text"; searchText: string }
  | { t: "clicked-result"; userId: UserId };

export type Req = { t: "search"; searchText: string };

export type Res = Req & { result: Result<string, SearchResult[]> };
