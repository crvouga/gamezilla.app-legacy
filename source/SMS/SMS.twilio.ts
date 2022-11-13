import twilio from "twilio";
import { Unit } from "../Core";
import { Err, Ok } from "../Core/Result";
import { PhoneNumber } from "../Data";
import { SMS } from "./SMS";

const twilioAccountSid = "ACd7936c09aaa6aeb6e89a8a2374f0dbc8"
const twilioAuthToken = "70a3da99b8052fd3b4fbef13af0cb987"
// const twilioMessageServiceSid = "MG40659e41bab12651ca460f306b66f44c"

const client = twilio(twilioAccountSid, twilioAuthToken)

export const sms: SMS = {
    send: (params) => async () => {
        try {
            await client.messages.create({
                to: PhoneNumber.toString(params.to),
                body: params.message
            })
            return Ok(Unit)
        } catch (error) {
            return Err("unknown")
        }
    }
}