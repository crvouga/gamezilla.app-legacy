import { Result } from '~/@/result'
import { RPC } from '~/@/rpc'
import { RPCError } from '~/@/rpc/error'
import { s } from '~/@/schema'
import { UserAccount } from '~/app/@/data/user-account'
import { SendCodeInput, SendCodeOutput, VerifyCodeInput } from '../@/backend/verify-sms'
import { VerifyCodeProblem } from '../@/backend/verify-sms/verify-code-problem'
import { UserSession } from '../@/user-session/user-session'

export type Sent = Result<RPCError, SendCodeOutput>

const VerifyCodeOutput = Result.schema(
  VerifyCodeProblem.schema,
  s.obj({ userAccount: UserAccount, userSession: UserSession }),
)
export type VerifyCodeOutput = s.Infer<typeof VerifyCodeOutput>
export type Verified = Result<RPCError, VerifyCodeOutput>

export const rpcContract = RPC.initContract({
  loginWithSms_sendCode: {
    input: SendCodeInput,
    output: SendCodeOutput,
  },
  loginWithSms_verifyCode: {
    input: VerifyCodeInput,
    output: VerifyCodeOutput,
  },
})
