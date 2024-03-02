import { err } from "gamezilla-app/@SHARED/core"
import { SMS } from "./sms"

export const createSMSTwilio = (): SMS => {
  return {
    sendMessage: async (_input) => {
      return err("not-implemented")
    },
  }
}
