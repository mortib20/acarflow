import { StatsD } from "node-statsd";
import { Server } from "socket.io";
import Logger from "./lib/Logger";
import Acarsdec from "./lib/acars/Acarsdec";
import DumpHfdl from "./lib/acars/DumpHfdl";
import DumpVdl2 from "./lib/acars/DumpVdl2";
import Jaero from "./lib/acars/Jaero";
import MinimizedAcars from "./lib/acars/MinimizedAcars";
import UdpInput from "./lib/input/UdpInput";
import OutputManager from "./lib/OutputManager";

export async function Main() {
    const outputManager = new OutputManager();
    const inputPort = 21000;
    const websocketPort = 21001;
    const logger = new Logger('MAIN');
    const input = new UdpInput('0.0.0.0', inputPort);
    const websocket = new Server().listen(websocketPort);
    const stats = new StatsD('192.168.168.1', 8125);

    logger.info('Starting ACARFLOW');
    logger.info(`Websocket exposed on ${websocketPort}`);

    input.onMessage = (buffer, _) => {
        if (buffer.length < 100) {
            return;
        }

        const json = JSON.parse(buffer.toString('utf-8'));

        if (!json) {
            return;
        }

        let acars: MinimizedAcars | undefined;

        if (json['vdl2']?.['app']?.['name'] === 'dumpvdl2' && json['vdl2']?.['avlc']?.['acars']) {
            const dumpvdl2 = json as DumpVdl2;
            acars = MinimizedAcars.fromDumpVDL2(dumpvdl2);
            OutputManager.write(outputManager.dumpvdl2, buffer);
        }

        if (json['hfdl']?.['app']?.['name'] === 'dumphfdl' && json['hfdl']?.['lpdu']?.['hfnpdu']?.['acars']) {
            const dumphfdl = json as DumpHfdl;
            acars = MinimizedAcars.fromDumpHFDL(dumphfdl);
            OutputManager.write(outputManager.dumphfdl, buffer);
        }

        if (json['app']?.['name'] === 'acarsdec') {
            const acarsdec = json as Acarsdec;
            acars = MinimizedAcars.fromAcarsdec(acarsdec);
            OutputManager.write(outputManager.acarsdec, buffer);
        }

        if (json['app']?.['name'] === 'JAERO' && json['isu']?.['acars']) {
            const jaero = json as Jaero;
            acars = MinimizedAcars.fromJaero(jaero);
            OutputManager.write(outputManager.jaero, buffer);
        }

        if (acars) {
            const tags = [`type=${acars.type}}`, `channel=${acars.channel}`, `receiver=${acars.receiver}`, `label=${acars.label}`];
            stats.histogram(`acars`, 1, undefined, tags);
            websocket.emit(acars.type, acars);
        }
    };

    input.listen();
}

Main();