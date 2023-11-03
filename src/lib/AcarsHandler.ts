import OutputHandler from "./OutputHandler";
import Acarsdec from "./acars/Acarsdec";
import DumpHfdl from "./acars/DumpHfdl";
import DumpVdl2 from "./acars/DumpVdl2";
import Jaero from "./acars/Jaero";
import MinimizedAcars from "./acars/MinimizedAcars";
import StatisticsHandler from "./StatisticsHandler";
import WebsocketHandler from "./WebsocketHandler";

export default class AcarsHandler {
    public constructor(private readonly outputHandler: OutputHandler, private readonly statisticsHandler: StatisticsHandler, private readonly websocketHandler: WebsocketHandler) {
    }

    public handle(buffer: Buffer) {
        if (buffer.length < 100) {
            return;
        }

        const json = JSON.parse(buffer.toString('utf-8'));

        if (!json) {
            return;
        }

        let acars: MinimizedAcars | undefined;
        if (AcarsHandler.isDumpVdl2(json)) {
            const dumpvdl2 = json as DumpVdl2;
            acars = MinimizedAcars.fromDumpVDL2(dumpvdl2);
            OutputHandler.write(this.outputHandler.dumpvdl2, buffer);
        }

        if (AcarsHandler.isDumpHfdl(json)) {
            const dumphfdl = json as DumpHfdl;
            acars = MinimizedAcars.fromDumpHFDL(dumphfdl);
            OutputHandler.write(this.outputHandler.dumphfdl, buffer);
        }

        if (AcarsHandler.isAcarsdec(json)) {
            const acarsdec = json as Acarsdec;
            acars = MinimizedAcars.fromAcarsdec(acarsdec);
            OutputHandler.write(this.outputHandler.acarsdec, buffer);
        }

        if (AcarsHandler.isJaero(json)) {
            const jaero = json as Jaero;
            acars = MinimizedAcars.fromJaero(jaero);
            OutputHandler.write(this.outputHandler.jaero, buffer);
        }

        if (acars) {
            const tags = [`type=${acars.type}}`, `channel=${acars.channel}`, `receiver=${acars.receiver}`, `label=${acars.label}`];
            this.statisticsHandler.increment(`acars`, tags);
            this.websocketHandler.send(acars.type, acars);
        }
    }

    private static isDumpVdl2(json: any): boolean {
        return json['vdl2']?.['app']?.['name'] === 'dumpvdl2' && json['vdl2']?.['avlc']?.['acars'];
    }

    private static isDumpHfdl(json: any): boolean {
        return json['hfdl']?.['app']?.['name'] === 'dumphfdl' && json['hfdl']?.['lpdu']?.['hfnpdu']?.['acars'];
    }

    private static isAcarsdec(json: any): boolean {
        return json['app']?.['name'] === 'acarsdec';
    }

    private static isJaero(json: any): boolean {
        return json['app']?.['name'] === 'JAERO' && json['isu']?.['acars'];
    }

    public static create(outputHandler: OutputHandler, statisticsHandler: StatisticsHandler, websocketHandler: WebsocketHandler) {
        return new AcarsHandler(outputHandler, statisticsHandler, websocketHandler);
    }
}