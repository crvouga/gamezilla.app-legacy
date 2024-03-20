import { describe, expect, it } from "bun:test"
import { AccountRow } from "./account-db-impl.postgres"

describe(import.meta.file, () => {
  it("should parse correctly", () => {
    const row: AccountRow = {
      created_at: "2021-01-01T00:00:00Z",
      email_address: null,
      phone_number: null,
      user_id: "123",
      user_role: "guest",
    }

    expect(AccountRow.parse(row).t === "ok").toBeTrue()
  })
})
