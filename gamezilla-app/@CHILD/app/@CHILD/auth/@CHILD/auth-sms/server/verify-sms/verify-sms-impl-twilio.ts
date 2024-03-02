import { err } from "gamezilla-app/@SHARED/core"
import { IVerifySMS } from "./verify-sms"

export const VerifySMS = (): IVerifySMS => {
  return {
    async sendCode(_input) {
      return err("not implemented")
    },
    async verifyCode(_input) {
      return err("not implemented")
    },
  }
}
