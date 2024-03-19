export type HttpRequest = {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";
    url: string;
    headers: Record<string, string>;
    body: string | null;
};
export type HttpResponse = {
    status: number;
    headers: Record<string, string>;
    body: string | null;
};
export type HttpHandler = (request: HttpRequest) => Promise<HttpResponse | null | undefined>;
export type IServer = {
    start: (port: number) => Promise<void>;
    serveSinglePageApp: (input: {
        directory: string;
        file: string;
    }) => void;
    registerHandler: (handler: HttpHandler) => void;
};
