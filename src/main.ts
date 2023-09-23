import * as dns from "dns/promises";
import { StatsD } from "node-statsd";
import { Server as WsServer } from "socket.io";
import { IncreaseStats, MakeWsMessage, SendMessage } from "./Utils";
import DetectAcarsType, { AcarsType } from "./acars/DetectAcarsType";
import UdpInput from "./class/input/UdpInput";
import TcpOutput from "./class/output/TcpOutput";
import UdpOutput from "./class/output/UdpOutput";
import IInput from "./interface/IInput";
import IOutput from "./interface/IOutput";
import Remote from "./interface/Remote";

import * as p from "prom-client";
import * as http from "http";

const register = new p.Registry();

register.setDefaultLabels({
    app: "acarflow"
});

p.collectDefaultMetrics({ register });

var metrics = {
    hfdl: new p.Gauge({name: "acarflow_hfdl_messages", help: "HFDL Message Count"}),
    satcom: new p.Gauge({name: "acarflow_satcom_messages", help: "SATCOM Message Count"}),
    vdl2: new p.Gauge({name: "acarflow_vdl2_messages", help: "VDL2 Message Count"}),
    acars: new p.Gauge({name: "acarflow_acars_messages", help: "ACARS Message Count"})
}

const server = http.createServer(async (req, res) => {
    const route = req.url;

    if (route == "/metrics") {
        res.setHeader("Content-Type", register.contentType);
        res.end(await register.metrics());
    }
    else {
        res.statusCode = 404;
        res.end();
    }
});

server.listen(8080);

/*
ACARS, VDL2, SATCOM, HFDL - YES
TCP/UDP Input - YES
TCP/UDP Output - YES
feed to feed.acars.io - YES
socket.io output - YES
statistic - YES
*/
async function Main() {
    const stats = new StatsD("192.168.168.1", 8125);
    const inputs: IInput[] = [
        new UdpInput("0.0.0.0", 21000)
    ];

    const airframesIp = (await dns.resolve4("feed.airframes.io"))[0]; // Temporary used to resolve airframes

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

    inputs.forEach(input => {
        input.onData((data: Buffer, remote: Remote) => {
            let type: AcarsType | null = DetectAcarsType(data);

            switch (type) {
                case AcarsType.ACARS:
                    SendMessage(outs.acars, data);
                    metrics.acars.inc(1);
                    break;
                case AcarsType.VDL2:
                    SendMessage(outs.vdl2, data);
                    metrics.vdl2.inc(1);
                    break;
                case AcarsType.HFDL:
                    SendMessage(outs.hfdl, data);
                    metrics.vdl2.inc(1);
                    break;
                case AcarsType.SATCOM:
                    SendMessage(outs.satcom, data);
                    metrics.satcom.inc(1);
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