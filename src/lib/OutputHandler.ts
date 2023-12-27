import {readFileSync} from 'fs'
import Logger from './Logger'
import IOutput from './output/IOutput'
import TcpOutput from './output/TcpOutput'
import UdpOutput from './output/UdpOutput'

export default class OutputHandler {
    private static readonly OUTPUTS_CONFIG_PATH = 'outputs.json'

    private constructor(public readonly dumpvdl2: IOutput[], public readonly dumphfdl: IOutput[], public readonly acarsdec: IOutput[], public readonly jaero: IOutput[], private readonly logger: Logger) {
    }

    public static async create() {
        const logger = new Logger(this.name)

        logger.info(`Reading ${this.OUTPUTS_CONFIG_PATH}`)
        const outputsConfig = this.readOutputsConfig()

        const outputs = {
            dumpvdl2: await Promise.all(this.createOutputs(outputsConfig.dumpvdl2)),
            dumphfdl: await Promise.all(this.createOutputs(outputsConfig.dumphfdl)),
            acarsdec: await Promise.all(this.createOutputs(outputsConfig.acarsdec)),
            jaero: await Promise.all(this.createOutputs(outputsConfig.jaero)),
        }

        return new OutputHandler(outputs.dumpvdl2, outputs.dumphfdl, outputs.acarsdec, outputs.jaero, logger)
    }

    private static readOutputsConfig(): OutputsConfig {
        try {
            return JSON.parse(readFileSync(this.OUTPUTS_CONFIG_PATH, {encoding: 'utf-8'}))
        } catch (err) {
            throw new Error('Failed to read outputs')
        }
    }

    private static createOutputs(outputItemConfigs: OutputConfig[]) {
        return outputItemConfigs.map(async out => out.protocol.toUpperCase() === 'TCP' ? TcpOutput.create(out.hostname, out.port) as IOutput : await UdpOutput.create(out.hostname, out.port) as IOutput)
    }

    public static write(outputs: IOutput[], buffer: Buffer) {
        outputs.forEach(out => out.send(buffer))
    }
}

export interface OutputsConfig {
    dumpvdl2: OutputConfig[]
    dumphfdl: OutputConfig[]
    acarsdec: OutputConfig[]
    jaero: OutputConfig[]
}

export interface OutputConfig {
    protocol: 'tcp' | 'udp'
    hostname: string
    port: number
}