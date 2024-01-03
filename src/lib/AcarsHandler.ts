import OutputHandler from './OutputHandler'
import StatisticsHandler from './StatisticsHandler'
import WebsocketHandler from './WebsocketHandler'
import Acarsdec from './acars/Acarsdec'
import DumpHfdl from './acars/DumpHfdl'
import DumpVdl2 from './acars/DumpVdl2'
import Jaero from './acars/Jaero'
import BasicAcars from './acars/BasicAcars'
import TcpOutputHandler from './TcpOutputHandler'
import CouchDBHandler from './CouchDBHandler'
import VDL2FeatureSearch from './feature/VDL2FeatureSearch'

export default class AcarsHandler {
    private constructor(private readonly outputHandler: OutputHandler, private readonly websocketHandler: WebsocketHandler, private readonly statisticsHandler: StatisticsHandler, private readonly tcpOutputHandler: TcpOutputHandler, private readonly couchDBHandler: CouchDBHandler) {
    }

    public handle(buffer: Buffer) {
        if (buffer.length < 100) {
            return
        }

        const json = JSON.parse(buffer.toString('utf-8'))

        if (!json) {
            return
        }

        let acars: BasicAcars | undefined

        if (AcarsHandler.isDumpVdl2(json)) {
            OutputHandler.write(this.outputHandler.dumpvdl2, buffer)
            if (AcarsHandler.isAcarsFrame(json)) {
                const dumpvdl2 = json as DumpVdl2
                acars = BasicAcars.fromDumpVDL2(dumpvdl2)

                // TODO Put this in extra class AcarsFeatureExtractor?
                const position = VDL2FeatureSearch.SearchPosition(acars.label, acars.text)
                if (position) {
                    this.outputHandler.sendPositionBasestation(acars.icao, acars.flight, position.lat, position.lon)
                }
            }
        }

        if (AcarsHandler.isDumpHfdl(json)) {
            OutputHandler.write(this.outputHandler.dumphfdl, buffer)
            if (AcarsHandler.isAcarsFrame(json)) {
                const dumphfdl = json as DumpHfdl
                acars = BasicAcars.fromDumpHFDL(dumphfdl)
            }
        }

        if (AcarsHandler.isAcarsdec(json)) {
            OutputHandler.write(this.outputHandler.acarsdec, buffer)
            if (AcarsHandler.isAcarsFrame(json)) {
                const acarsdec = json as Acarsdec
                acars = BasicAcars.fromAcarsdec(acarsdec)
            }
        }

        if (AcarsHandler.isJaero(json)) {
            OutputHandler.write(this.outputHandler.jaero, buffer)
            if (AcarsHandler.isAcarsFrame(json)) {
                const jaero = json as Jaero
                acars = BasicAcars.fromJaero(jaero)
            }
        }

        if (acars) {
            this.statisticsHandler
                .receivedMessagesTotal
                .labels({
                    label: acars.label,
                    type: acars.type,
                    channel: acars.channel,
                    icao: acars.icao || '000000'
                }).inc()
            this.websocketHandler.send(acars.type, acars)
            this.tcpOutputHandler.write(JSON.stringify(acars))
            this.couchDBHandler.writeFrame(acars)
        }
    }

    private static isDumpVdl2(json: any): boolean {
        return json['vdl2']?.['app']?.['name'] === 'dumpvdl2'
    }


    private static isDumpHfdl(json: any): boolean {
        return json['hfdl']?.['app']?.['name'] === 'dumphfdl'
    }

    private static isAcarsdec(json: any): boolean {
        return json['app']?.['name'] === 'acarsdec'
    }

    private static isJaero(json: any): boolean {
        return json['app']?.['name'] === 'JAERO'
    }

    private static isAcarsFrame(json: any): boolean {
        return !!(json['vdl2']?.['avlc']?.['acars'] || json['hfdl']?.['lpdu']?.['hfnpdu']?.['acars'] || json['isu']?.['acars'] || json['text'])
    }

    public static create(outputHandler: OutputHandler, websocketHandler: WebsocketHandler, statisticsHandler: StatisticsHandler, tcpOutputHandler: TcpOutputHandler, couchDBHandler: CouchDBHandler) {
        return new AcarsHandler(outputHandler, websocketHandler, statisticsHandler, tcpOutputHandler, couchDBHandler)
    }
}