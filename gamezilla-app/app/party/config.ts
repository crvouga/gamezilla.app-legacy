/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import type { RtpCodecCapability } from "mediasoup/node/lib/RtpParameters";
//@ts-ignore
import type { TransportListenIp } from "mediasoup/node/lib/Transport";
//@ts-ignore
import type { WorkerLogTag } from "mediasoup/node/lib/Worker";

// source: https://github.com/benawad/dogehouse/blob/staging/shawarma/src/config.ts#L2

export const Config = {
	// http server ip, port, and peer timeout constant
	//
	httpIp: "0.0.0.0",
	httpPort: 3000,
	httpPeerStale: 360000,

	mediasoup: {
		worker: {
			rtcMinPort: 40000,
			rtcMaxPort: 49999,
			logLevel: "debug",
			logTags: [
				"info",
				"ice",
				"dtls",
				"rtp",
				"srtp",
				"rtcp",
				// 'rtx',
				// 'bwe',
				// 'score',
				// 'simulcast',
				// 'svc'
			] as WorkerLogTag[],
		},
		router: {
			mediaCodecs: [
				{
					kind: "audio",
					mimeType: "audio/opus",
					clockRate: 48000,
					channels: 2,
				},
			] as RtpCodecCapability[],
		},

		// rtp listenIps are the most important thing, below. you'll need
		// to set these appropriately for your network for the demo to
		// run anywhere but on localhost
		webRtcTransport: {
			listenIps: [
				// {
				//     ip: process.env.WEBRTC_LISTEN_IP || "192.168.1.165",
				//     announcedIp: process.env.A_IP || undefined,
				// },
				{ ip: "127.0.0.1", announcedIp: undefined },
				// { ip: "192.168.42.68", announcedIp: undefined },
				// { ip: '10.10.23.101', announcedIp: null },
			] as TransportListenIp[],
			initialAvailableOutgoingBitrate: 800000,
		},
	},
} as const;
