import { StatsD } from "node-statsd";
import { Server as WsServer } from "socket.io";
import { IncreaseStats, MakeWsMessage, SendMessage } from "./Utils";
import DetectAcarsType from "./acars/DetectAcarsType";
import { AcarsType } from "./acars/TypesEnum";
import TcpInput from "./class/input/TcpInput";
import { default as Output, default as TcpOutput } from "./class/output/TcpOutput";
import UdpOutput from "./class/output/UdpOutput";
import IInput from "./interface/IInput";
import IOutput from "./interface/IOutput";
import { Remote } from "./interface/InOutStuff";
import * as dns from "dns/promises";

/*
ACARS, VDL2, SATCOM, HFDL - YES
TCP/UDP Input - YES
TCP/UDP Output - YES
feed to feed.acars.io - YES
socket.io output - YES
statistic - YES
*/
const stats = new StatsD("192.168.168.1", 8125);
const inputs: IInput[] = [
    new TcpInput("0.0.0.0", 21000)
]

async function Main() {
    let airframesIp = (await dns.resolve4("feed.airframes.io"))[0];

    const outs: { acars: IOutput[], vdl2: IOutput[], hfdl: IOutput[], satcom: IOutput[], ws: WsServer } = {
        acars: [
            new UdpOutput(airframesIp, 5550)
        ],
        vdl2: [
            new UdpOutput(airframesIp, 5552)
        ],
        hfdl: [
            new TcpOutput(airframesIp, 5556)
        ],
        satcom: [
            new UdpOutput(airframesIp, 5571)
        ],
        ws: new WsServer(21001)
    };
    
    inputs.forEach(i => {
        i.onData((data: Buffer, remote: Remote) => {
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
    })
}

Main();