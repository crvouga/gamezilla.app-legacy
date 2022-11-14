import { Device } from "mediasoup-client"
import * as Rx from "rxjs"
import { Err, Ok } from "../Core/Result"
import { ToClient, ToServer } from "./VoiceRoom.Types"

export const VoiceRoomClient = ({ }: { localStream: MediaStream }) => {
    const toServer$ = new Rx.Subject<ToServer>()
    const fromServer$ = new Rx.Subject<ToClient>()
    const device = new Device()


    const createRoom = async ({ roomId, peerId }: { roomId: string, peerId: string }) => {
        toServer$.next({ type: "CreateRoom", roomId, peerId })

        const msg = await Rx.lastValueFrom(fromServer$.pipe(Rx.mergeMap(msg => msg.type === 'CreateRoom_Done' ? Rx.of(msg) : Rx.NEVER)))

        if (msg.result.type === 'Err') {
            return msg.result
        }

        try {
            await device.load({
                routerRtpCapabilities: msg.result.value.rtpCapabilities
            })
        } catch (error) {
            return Err("device_load_failed")
        }

        return Ok(null)
    }

    const joinRoom = async ({ roomId }: { roomId: string }) => {
        toServer$.next({ type: "JoinRoom", roomId })

        const msg = await Rx.lastValueFrom(fromServer$.pipe(Rx.mergeMap(msg => msg.type === 'JoinRoom_Done' ? Rx.of(msg) : Rx.NEVER)))

        if (msg.result.type === 'Err') {
            return msg.result
        }

        try {
            await device.load({
                routerRtpCapabilities: msg.result.value.rtpCapabilities
            })
        } catch (error) {
            return Err("device_load_failed")
        }


        return Ok(null)
    }

    return {
        toServer$,
        fromServer$,
        joinRoom,
        createRoom,
    }
}