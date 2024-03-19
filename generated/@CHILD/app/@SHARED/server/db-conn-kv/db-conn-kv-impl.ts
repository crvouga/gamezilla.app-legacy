import { Logger } from "../logger";
import { DbConnKv } from "./db-conn-kv";
import { createDbConnKvHashMap } from "./db-conn-kv-impl-hash-map";
import { createDbConnKvRedis } from "./db-conn-kv-impl-redis";
export type Impl = {
    t: "hash-map";
} | {
    t: "redis";
    url: string;
    logger: Logger;
};
export const createDbConnKv = async (impl: Impl): Promise<DbConnKv> => {
    switch (impl.t) {
        case "hash-map": {
            return createDbConnKvHashMap();
        }
        case "redis": {
            return createDbConnKvRedis({ url: impl.url, logger: impl.logger });
        }
    }
};
