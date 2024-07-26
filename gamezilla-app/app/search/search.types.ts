import type {Browser, RemoteResult, Result} from 'gamezilla-app/@/core';
import type {UserId, Username} from 'gamezilla-app/app/@/data';

type SearchResult = {
	t: 'profile';
	id: string;
	userId: UserId;
	username: Username;
	avatarUrl: string;
};

export type ModelClient = {
	searchText: string;
	searchResults: {
		[id: string]: SearchResult;
	};
	requests: {
		[searchText: string]: RemoteResult<
			string,
			null
		>;
	};
};

export type ModelServer = null;

export type MsgToServer = Req;

export type MsgToClient = Res;

export type MsgServer = {t: 'none'};

export type MsgClient =
	| Req
	| {t: 'clicked-clear'}
	| {t: 'focus-done'; result: Browser.FocusResult}
	| {t: 'inputted-search-text'; searchText: string}
	| {t: 'clicked-result'; userId: UserId};

export type Req = {t: 'search'; searchText: string};

export type Res = Req & {result: Result<string, SearchResult[]>};
