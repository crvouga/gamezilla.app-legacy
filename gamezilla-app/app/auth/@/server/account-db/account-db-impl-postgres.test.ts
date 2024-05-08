import { describe, expect, it } from "bun:test";
import type { UserId } from "gamezilla-app/app/@/data";
import { UserAccountRow } from "./account-db-impl-postgres";

describe(import.meta.file, () => {
	it("should parse correctly", async () => {
		const row: UserAccountRow = {
			created_at: "2021-01-01T00:00:00Z",
			user_id: "123" as UserId,
			user_role: "guest",
			phone_number: null,
		};

		expect(UserAccountRow.parse(row).t === "ok").toBe(true);
	});
});
