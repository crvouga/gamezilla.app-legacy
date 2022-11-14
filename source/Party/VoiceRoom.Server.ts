import mediasoup from "mediasoup"
import { Consumer } from "mediasoup/node/lib/Consumer"
import { Producer } from "mediasoup/node/lib/Producer"
import { Transport } from "mediasoup/node/lib/Transport"
import * as Rx from "rxjs"
import { Err, Ok } from "../Core/Result"
import { Config } from "./Config"
import { ToClient, ToServer } from "./VoiceRoom.Types"


type Room = {
    roomId: string,
    router: mediasoup.types.Router,
    peers: {
        [peerId: string]: Peer
    }
}

type Peer = {
    peerId: string
    sendTransport: Transport | null;
    recvTransport: Transport | null;
    producer: Producer | null;
    consumers: Consumer[];
}

export const VoiceRoomServer = async () => {
    const toClient$ = new Rx.Subject<ToClient>()
    const fromClient$ = new Rx.Subject<ToServer>()

    const worker = await mediasoup.createWorker(Config.mediasoup.worker)
    worker.on("died", () => {
        console.log("worker died")
    })

    const rooms: { [roomId: string]: Room } = {}

    fromClient$.subscribe(async (msg) => {
        switch (msg.type) {
            case 'CreateRoom': {
                const router = await worker.createRouter(Config.mediasoup.router)

                const sendTransport = await router.createWebRtcTransport(Config.mediasoup.webRtcTransport)

                const peerNew: Peer = {
                    peerId: msg.peerId,
                    consumers: [],
                    producer: null,
                    recvTransport: null,
                    sendTransport
                }

                const roomNew: Room = {
                    roomId: msg.roomId,
                    router,
                    peers: {
                        [peerNew.peerId]: peerNew,
                    },
                }

                rooms[roomNew.roomId] = roomNew

                toClient$.next({
                    type: "CreateRoom_Done",
                    roomId: roomNew.roomId,
                    result: Ok({ rtpCapabilities: router.rtpCapabilities })
                })
                return
            }

            case 'JoinRoom': {
                const room = rooms[msg.roomId]

                if (!room) {
                    toClient$.next({
                        type: "JoinRoom_Done",
                        result: Err("room_not_found")
                    })
                    return
                }



                toClient$.next({
                    type: "JoinRoom_Done",
                    result: Ok({ rtpCapabilities: room.router.rtpCapabilities })
                })
                return
            }
        }
    })

    return {
        toClient$,
        fromClient$,
    }
}

