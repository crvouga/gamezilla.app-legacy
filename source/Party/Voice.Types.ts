import { RtpCapabilities } from "mediasoup/node/lib/RtpParameters"
import { Result } from "../Core"

export type ToServer =
    | {
        type: "JoinRoom",
        roomId: string
    }
    | {
        type: "CreateRoom",
        roomId: string,
        peerId: string
    }

export type ToClient =
    | {
        type: "CreateRoom_Done",
        roomId: string,
        result: Result<"unknown", { rtpCapabilities: RtpCapabilities }>
    }
    | {
        type: "JoinRoom_Done",
        result: Result<"room_not_found", { rtpCapabilities: RtpCapabilities }>
    }