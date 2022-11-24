import { Unit } from "../Core"
import { Result } from "../Core/Result"
import { Task } from "../Core/Task"
import { PhoneNumber } from "../Data/PhoneNumber"

export type SendResult = Result<"unknown", Unit>
export type SMS = {
  send: (params: { to: PhoneNumber; message: string }) => Task<SendResult>
}
