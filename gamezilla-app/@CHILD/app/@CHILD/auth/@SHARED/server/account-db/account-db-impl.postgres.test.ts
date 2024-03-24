import { describe, expect, it } from "bun:test"
import { AccountRow } from "./account-db-impl.postgres"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"

describe(import.meta.file, () => {
  it("should parse correctly", async () => {
    const row: AccountRow = {
      created_at: "2021-01-01T00:00:00Z",
      email_address: null,
      phone_number: null,
      user_id: "123" as UserId,
      user_role: "guest",
    }

    expect(AccountRow.parse(row).t === "ok").toBe(true)
  })
})
