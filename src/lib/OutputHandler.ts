import {readFileSync} from 'fs'
import Logger from './Logger'
import IOutput from './output/IOutput'
import TcpOutput from './output/TcpOutput'
import UdpOutput from './output/UdpOutput'

export default class OutputHandler {
    private static readonly OUTPUTS_CONFIG_PATH = 'outputs.json'

    private constructor(public readonly dumpvdl2: IOutput[], public readonly dumphfdl: IOutput[], public readonly acarsdec: IOutput[], public readonly jaero: IOutput[], public readonly basestation: IOutput[], private readonly logger: Logger) {
    }

    public static async create() {
        const logger = new Logger(this.name)

        logger.info(`Reading ${this.OUTPUTS_CONFIG_PATH}`)
        const outputsConfig = this.readOutputsConfig()

        const outputs = {
            dumpvdl2: await Promise.all(this.createOutputs(outputsConfig.dumpvdl2, 'dumpvdl2')),
            dumphfdl: await Promise.all(this.createOutputs(outputsConfig.dumphfdl, 'dumphfdl')),
            acarsdec: await Promise.all(this.createOutputs(outputsConfig.acarsdec, 'acarsdec')),
            jaero: await Promise.all(this.createOutputs(outputsConfig.jaero, 'jaero')),
            basestation: await Promise.all(this.createOutputs(outputsConfig.basestation, 'basestation'))
        }

        return new OutputHandler(outputs.dumpvdl2, outputs.dumphfdl, outputs.acarsdec, outputs.jaero, outputs.basestation, logger)
    }

    private static readOutputsConfig(): OutputsConfig {
        try {
            return JSON.parse(readFileSync(this.OUTPUTS_CONFIG_PATH, {encoding: 'utf-8'}))
        } catch (err) {
            throw new Error('Failed to read outputs')
        }
    }

    private static createOutputs(outputItemConfigs: OutputConfig[], name?: string) {
        return outputItemConfigs.map(async out => out.protocol.toUpperCase() === 'TCP' ? TcpOutput.create(out.hostname, out.port, name) as IOutput : await UdpOutput.create(out.hostname, out.port, name) as IOutput)
    }

    public static write(outputs: IOutput[], buffer: Buffer) {
        outputs.forEach(out => out.send(buffer))
    }
    
    public sendPositionBasestation(aircraftId: string, callsign: string, lat: number, lon: number) {
        const currentDate = new Date().toISOString()
        const date = `${currentDate.slice(0,4)}/${currentDate.slice(5,7)}/${currentDate.slice(8,10)}`
        const time = currentDate.slice(11, 19) + '.000'
        
        const buffer = Buffer.from(`MSG,3,1,1,${aircraftId},1,${date},${time},${date},${time},${callsign},,,,${lat.toFixed(6)},${lon.toFixed(6)},,0,,,,0\n`)
        this.basestation.forEach(out => out.send(buffer))
    }
}

export interface OutputsConfig {
    dumpvdl2: OutputConfig[]
    dumphfdl: OutputConfig[]
    acarsdec: OutputConfig[]
    jaero: OutputConfig[]
    basestation: OutputConfig[]
}

export interface OutputConfig {
    protocol: 'tcp' | 'udp'
    hostname: string
    port: number
}