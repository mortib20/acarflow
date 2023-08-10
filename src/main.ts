import { StatsD } from "node-statsd";
import { Server as WsServer } from "socket.io";
import { IncreaseStats, MakeWsMessage, SendMessage } from "./Utils";
import DetectAcarsType from "./acars/DetectAcarsType";
import { AcarsType } from "./acars/TypesEnum";
import Input from "./class/Input";
import Output from "./class/Output";
import { Protocol, Remote } from "./interface/InOutStuff";

/*
ACARS, VDL2, SATCOM, HFDL - YES
TCP/UDP Input - YES
TCP/UDP Output - YES
feed to feed.acars.io - YES
socket.io output - YES
statistic - YES
*/
const stats = new StatsD("192.168.168.1", 8125);
const input = new Input({ hostname: "0.0.0.0", port: 21000, protocol: Protocol.UDP });

const outs = {
    acars: [
        new Output({ hostname: "feed.airframes.io", port: 5550, protocol: Protocol.UDP })
    ],
    vdl2: [
        new Output({ hostname: "feed.airframes.io", port: 5552, protocol: Protocol.UDP })
    ],
    hfdl: [
        new Output({ hostname: "feed.airframes.io", port: 5556, protocol: Protocol.TCP })
    ],
    satcom: [
        new Output({ hostname: "feed.airframes.io", port: 5571, protocol: Protocol.UDP })
    ],
    ws: new WsServer(21001)
};

input.on('data', (data: Buffer, remote: Remote) => {
    let type: AcarsType | null = DetectAcarsType(data);

    switch (type) {
        case AcarsType.ACARS:
            SendMessage(outs.acars, data);
            break;
        case AcarsType.VDL2:
            SendMessage(outs.vdl2, data);
            break;
        case AcarsType.HFDL:
            SendMessage(outs.hfdl, data);
            break;
        case AcarsType.SATCOM:
            SendMessage(outs.satcom, data);
            break;
    }

    if (type != null) { // Output to Websocket and also increase statistic
        let json = JSON.parse(data.toString());
        //logger.info("websocket send");
        outs.ws.emit("NewData", MakeWsMessage(type, json));
        IncreaseStats(stats, type, json);
    }
})

