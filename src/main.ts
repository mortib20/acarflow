import { Server as WsServer } from "socket.io";
import DetectAcarsType from "./acars/DetectAcarsType";
import { AcarsType } from "./acars/TypesEnum";
import Input from "./class/Input";
import Logger from "./class/Logger";
import Output from "./class/Output";
import { Protocol, Remote } from "./interface/InOutStuff";
import { MakeHFDLMessage, MakeOldAcarsMessage, MakeSATCOMMessage, MakeVDL2Message } from "./acars/MakeMsg";
import { StatsD } from "node-statsd";
import TLACARS from "./acars/interface/Acars";
import VDL2 from "./acars/interface/VDL2";
import HFDL from "./acars/interface/HFDL";
import SATCOM from "./acars/interface/SATCOM";

/*
ACARS, VDL2, SATCOM, HFDL - YES
TCP/UDP Input - YES
TCP/UDP Output - YES
feed to feed.acars.io - YES
socket.io output - YES
statistic - YES
*/
const logger = new Logger("MAIN");


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
    //console.log(data.toString('utf-8'));
    let type: AcarsType | null = DetectAcarsType(data);

    switch (type) {
        case AcarsType.ACARS:
            //logger.info("isACARS");
            SendMessage(outs.acars, data);
            break;
        case AcarsType.VDL2:
            //logger.info("isVDL2");
            SendMessage(outs.vdl2, data);
            break;
        case AcarsType.HFDL:
            //logger.info("isHFDL");
            SendMessage(outs.hfdl, data);
            break;
        case AcarsType.SATCOM:
            //logger.info("isSATCOM");
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

function SendMessage(outs: Output[], data: Buffer) {
    outs.forEach(out => {
        out.send(data);
    })
}

function MakeWsMessage(type: AcarsType, json: any) {
    switch (type) {
        case AcarsType.ACARS:
            return MakeOldAcarsMessage(json);
        case AcarsType.VDL2:
            return MakeVDL2Message(json.vdl2);
        case AcarsType.HFDL:
            return MakeHFDLMessage(json.hfdl);
        case AcarsType.SATCOM:
            return MakeSATCOMMessage(json);
        default:
            return null;
    }
}

function IncreaseStats(stats: StatsD, type: AcarsType, json: any) {
    switch (type) {
        case AcarsType.ACARS:
            const acars = json as TLACARS;
            stats.histogram(`acars.${acars.station_id}.${acars.freq}`, 1);
            stats.increment(`count.acars.${acars.station_id}.${acars.freq}`, 1);
            break;
        case AcarsType.VDL2:
            const vdl2 = json as VDL2;
            stats.histogram(`vdl2.${vdl2.station}.${vdl2.freq}`, 1);
            stats.increment(`count.vdl2.${vdl2.station}.${vdl2.freq}`, 1);
            break;
        case AcarsType.HFDL:
            const hfdl = json as HFDL;
            stats.histogram(`hfdl.${hfdl.station}.${hfdl.freq}`, 1);
            stats.increment(`count.hfdl.${hfdl.station}.${hfdl.freq}`, 1);
            break;
        case AcarsType.SATCOM:
            const satcom = json as SATCOM;
            stats.histogram(`satcom.${satcom.station}.${satcom.app.ver}`, 1);
            stats.increment(`count.satcom.${satcom.station}.${satcom.app.ver}`, 1);
            break;
    }
}