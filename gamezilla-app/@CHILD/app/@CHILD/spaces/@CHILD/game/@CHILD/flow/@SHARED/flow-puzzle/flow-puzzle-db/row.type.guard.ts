/*
 * Generated type guards for "row.type.ts".
 * WARNING: Do not manually change this file.
 */
import { Row } from "./row.type";

export function isRow(obj: unknown): obj is Row {
    const typedObj = obj as Row
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["flow_puzzle_id"] === "string" &&
        typeof typedObj["flow_puzzle_name"] === "string" &&
        (typedObj["flow_puzzle"] !== null &&
            typeof typedObj["flow_puzzle"] === "object" ||
            typeof typedObj["flow_puzzle"] === "function") &&
        Object.entries<any>(typedObj["flow_puzzle"])
            .every(([key, _value]) => (typeof key === "string")) &&
        typeof typedObj["created_at"] === "string" &&
        typeof typedObj["created_by_user_id"] === "string" &&
        typeof typedObj["last_updated_at"] === "string" &&
        typeof typedObj["last_updated_by_user_id"] === "string"
    )
}
