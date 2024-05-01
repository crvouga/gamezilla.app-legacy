import { describe, expect, it } from "bun:test";
import { UserAccountRow } from "./account-db-impl-postgres";
import type { UserId } from "gamezilla-app/app/@shared/data";

describe(import.meta.file, () => {
	it("should parse correctly", async () => {
		const row: UserAccountRow = {
			created_at: "2021-01-01T00:00:00Z",
			user_id: "123" as UserId,
			user_role: "guest",
		};

		expect(UserAccountRow.parse(row).t === "ok").toBe(true);
	});
});
